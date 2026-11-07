<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeftRight, Check, Copy, Mic, Square, Volume2 } from 'lucide-vue-next'
import LanguageSelector from '../components/LanguageSelector.vue'
import { isSpeechRecognitionSupported, monitorMicrophone, requestMicrophonePermission, speakText, startListening, stopSpeaking } from '../services/speechService'
import { translateText } from '../services/translationService'

const sourceLanguage = ref('fr')
const targetLanguage = ref('rw')
const input = ref('')
const output = ref('')
const loading = ref(false)
const listening = ref(false)
const requestingPermission = ref(false)
const microphoneLevel = ref(0)
const microphoneHasSignal = ref(false)
const microphoneMeterAvailable = ref(true)
const copied = ref(false)
const serviceConnected = ref(false)
const speechPlaying = ref(false)
const speechPreparing = ref(false)
const status = ref('')
const speechStatus = ref('')
const speechError = ref('')
const error = ref('')
let recognition
let microphoneStream
let stopMicrophoneMonitor
let translationTimer
let translationRequestId = 0
let speechPlaybackRequestId = 0
let copyTimer
let recognitionRestartTimer
let stopRequested = false
let isMounted = true

const supported = isSpeechRecognitionSupported()
const locales = {
  ar: 'ar-SA', am: 'am-ET', bn: 'bn-BD', bg: 'bg-BG', ca: 'ca-ES', zh: 'zh-CN',
  hr: 'hr-HR', cs: 'cs-CZ', da: 'da-DK', nl: 'nl-NL', en: 'en-US', fi: 'fi-FI',
  fr: 'fr-FR', de: 'de-DE', el: 'el-GR', ha: 'ha-NG', he: 'he-IL', hi: 'hi-IN',
  hu: 'hu-HU', ig: 'ig-NG', id: 'id-ID', it: 'it-IT', ja: 'ja-JP', rw: 'rw-RW',
  rn: 'rn-BI', ko: 'ko-KR', lg: 'lg-UG', mg: 'mg-MG', ms: 'ms-MY', om: 'om-ET',
  no: 'nb-NO', fa: 'fa-IR', pl: 'pl-PL', pt: 'pt-BR', ro: 'ro-RO', ru: 'ru-RU',
  sr: 'sr-RS', sk: 'sk-SK', es: 'es-ES', so: 'so-SO', sn: 'sn-ZW', st: 'st-ZA',
  sv: 'sv-SE', sw: 'sw-KE', tl: 'fil-PH', th: 'th-TH', tr: 'tr-TR', uk: 'uk-UA',
  ur: 'ur-PK', vi: 'vi-VN', wo: 'wo-SN', xh: 'xh-ZA', yo: 'yo-NG', zu: 'zu-ZA',
}
const languageNames = {
  ar: 'Arabic', am: 'Amharic', bn: 'Bengali', bg: 'Bulgarian', ca: 'Catalan',
  zh: 'Chinese', hr: 'Croatian', cs: 'Czech', da: 'Danish', nl: 'Dutch',
  en: 'English', fi: 'Finnish', fr: 'French', de: 'German', el: 'Greek',
  ha: 'Hausa', he: 'Hebrew', hi: 'Hindi', hu: 'Hungarian', ig: 'Igbo',
  id: 'Indonesian', it: 'Italian', ja: 'Japanese', rw: 'Kinyarwanda',
  rn: 'Kirundi', ko: 'Korean', lg: 'Luganda', mg: 'Malagasy', ms: 'Malay',
  om: 'Oromo', no: 'Norwegian', fa: 'Persian', pl: 'Polish', pt: 'Portuguese',
  ro: 'Romanian', ru: 'Russian', sr: 'Serbian', sk: 'Slovak', es: 'Spanish',
  so: 'Somali', sn: 'Shona', st: 'Sesotho', sv: 'Swedish', sw: 'Swahili',
  tl: 'Tagalog', th: 'Thai', tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu',
  vi: 'Vietnamese', wo: 'Wolof', xh: 'Xhosa', yo: 'Yoruba', zu: 'Zulu',
}

const sourceLocale = computed(() => locales[sourceLanguage.value] || sourceLanguage.value)
const targetLocale = computed(() => locales[targetLanguage.value] || targetLanguage.value)
const targetLanguageName = computed(() => languageNames[targetLanguage.value] || 'Translation')

function releaseMicrophone() {
  stopMicrophoneMonitor?.()
  stopMicrophoneMonitor = undefined
  microphoneStream?.getTracks().forEach((track) => track.stop())
  microphoneStream = undefined
  microphoneLevel.value = 0
}

function saveToHistory(source, translated, sourceName, targetName) {
  try {
    const savedHistory = JSON.parse(localStorage.getItem('talkbridge.history') || '[]')
    if (!Array.isArray(savedHistory)) throw new Error('Saved translation history is invalid.')
    savedHistory.unshift({
      source,
      translated,
      sourceLanguage: sourceName,
      targetLanguage: targetName,
      time: new Date().toISOString(),
    })
    localStorage.setItem('talkbridge.history', JSON.stringify(savedHistory.slice(0, 50)))
  } catch {
    error.value = 'Translation succeeded, but this phrase could not be saved to history.'
  }
}

async function translate(textToTranslate, requestId) {
  loading.value = true
  error.value = ''
  status.value = 'Translating your phrase…'

  try {
    const result = await translateText({
      text: textToTranslate,
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
    })
    if (requestId !== translationRequestId) return

    output.value = result.translation
    serviceConnected.value = true
    status.value = `Translated to ${result.targetLanguageName}.`
    saveToHistory(textToTranslate, result.translation, result.sourceLanguageName, result.targetLanguageName)
  } catch (requestError) {
    if (requestId === translationRequestId) {
      serviceConnected.value = false
      error.value = requestError.response?.data?.error
        || 'The translation service could not be reached. Check the backend connection and try again.'
      status.value = ''
    }
  } finally {
    if (requestId === translationRequestId) loading.value = false
  }
}

watch([input, sourceLanguage, targetLanguage], ([text]) => {
  clearTimeout(translationTimer)
  if (speechPlaying.value || speechPreparing.value) {
    speechPlaybackRequestId += 1
    stopSpeaking()
    speechPlaying.value = false
    speechPreparing.value = false
    speechStatus.value = 'Playback stopped because the phrase or language changed.'
  }
  speechError.value = ''
  const requestId = ++translationRequestId
  error.value = ''
  output.value = ''
  loading.value = false
  copied.value = false

  if (!text.trim()) {
    status.value = listening.value ? 'Listening… Speak now.' : ''
    return
  }

  status.value = 'Preparing your translation…'
  translationTimer = setTimeout(() => {
    void translate(text.trim(), requestId)
  }, 450)
})

async function startVoiceTranslation() {
  if (listening.value || requestingPermission.value || !supported) return

  error.value = ''
  stopRequested = false
  requestingPermission.value = true
  status.value = 'Requesting microphone permission…'

  try {
    microphoneStream = await requestMicrophonePermission()
    if (!isMounted) {
      releaseMicrophone()
      return
    }
    microphoneHasSignal.value = false
    microphoneMeterAvailable.value = true
    stopMicrophoneMonitor = monitorMicrophone(microphoneStream, (level) => {
      if (level === null) {
        microphoneMeterAvailable.value = false
        return
      }
      microphoneLevel.value = Math.min(100, Math.round(level * 800))
      if (level >= 0.012) microphoneHasSignal.value = true
    })
    let noSpeechRetries = 0
    const beginRecognition = () => {
      if (!isMounted || stopRequested) return
      let heardSpeech = false
      let retryAfterNoSpeech = false
      let retriesExhausted = false

      try {
        recognition = startListening({
          language: sourceLocale.value,
          onResult: (transcript) => {
            heardSpeech = true
            if (transcript.length > 3000) {
              error.value = 'That speech was too long to translate. Please try a shorter phrase.'
              return
            }
            input.value = transcript
            status.value = 'Speech recognized. Preparing your translation…'
          },
          onError: (speechError) => {
            if (stopRequested) return
            if (speechError.code === 'no-speech' && noSpeechRetries < 2) {
              noSpeechRetries += 1
              retryAfterNoSpeech = true
              error.value = ''
              status.value = 'We didn’t catch that. Keep speaking; listening again…'
              return
            }
            if (speechError.code === 'no-speech') {
              retryAfterNoSpeech = true
              retriesExhausted = true
              status.value = !microphoneMeterAvailable.value
                ? 'Browser speech recognition did not return text, and this browser could not check microphone levels. Check the selected microphone, site permission, internet connection, and speech recognition support for this language.'
                : microphoneHasSignal.value
                  ? 'Your microphone is picking up sound, but browser speech recognition could not transcribe it. Check your internet connection and browser support for the selected language.'
                  : 'No sound is reaching your microphone. Check that the correct microphone is selected, unmuted, and allowed for this site.'
              return
            }
            listening.value = false
            status.value = ''
            error.value = speechError.message
          },
          onEnd: () => {
            if (stopRequested) {
              listening.value = false
              return
            }
            if (retryAfterNoSpeech) {
              if (!retriesExhausted) {
                recognitionRestartTimer = setTimeout(beginRecognition, 350)
              } else {
                listening.value = false
                releaseMicrophone()
              }
              return
            }
            listening.value = false
            releaseMicrophone()
            if (!heardSpeech && !error.value) {
              status.value = 'Listening stopped. Tap Start listening to try again.'
            }
          },
        })
        listening.value = true
        if (noSpeechRetries === 0) status.value = 'Listening… Speak now.'
      } catch (speechError) {
        listening.value = false
        releaseMicrophone()
        status.value = ''
        error.value = speechError.message
      }
    }

    beginRecognition()
  } catch (speechError) {
    releaseMicrophone()
    status.value = ''
    error.value = speechError.message
  } finally {
    requestingPermission.value = false
  }
}

function stopVoiceTranslation() {
  stopRequested = true
  clearTimeout(recognitionRestartTimer)
  recognition?.stop()
  releaseMicrophone()
  listening.value = false
  if (input.value.trim()) status.value = loading.value ? 'Translating your phrase…' : status.value
  else status.value = 'Listening stopped.'
}

function toggleListening() {
  if (listening.value) stopVoiceTranslation()
  else void startVoiceTranslation()
}

function swapLanguages() {
  const previousOutput = output.value
  ;[sourceLanguage.value, targetLanguage.value] = [targetLanguage.value, sourceLanguage.value]
  if (previousOutput) input.value = previousOutput
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    status.value = 'Translation copied to clipboard.'
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 1800)
  } catch {
    error.value = 'Clipboard access is unavailable. Select and copy the translation instead.'
  }
}

function playOutput() {
  if (!output.value.trim()) {
    speechStatus.value = ''
    speechError.value = 'There is no translated text to play yet.'
    return
  }

  const requestId = ++speechPlaybackRequestId
  speechError.value = ''
  speechPlaying.value = false
  speechPreparing.value = true
  speechStatus.value = `Finding a ${targetLanguageName.value} voice…`

  void speakText(output.value, targetLocale.value, {
    onStart: () => {
      if (requestId !== speechPlaybackRequestId) return
      speechPreparing.value = false
      speechPlaying.value = true
      speechStatus.value = `Playing ${targetLanguageName.value} translation.`
    },
    onEnd: () => {
      if (requestId !== speechPlaybackRequestId) return
      speechPreparing.value = false
      speechPlaying.value = false
      speechStatus.value = 'Playback finished.'
    },
    onError: (playbackError) => {
      if (requestId !== speechPlaybackRequestId) return
      speechPreparing.value = false
      speechPlaying.value = false
      speechStatus.value = ''
      speechError.value = playbackError.message
    },
  }).catch((playbackError) => {
    if (requestId !== speechPlaybackRequestId) return
    speechPreparing.value = false
    speechPlaying.value = false
    speechStatus.value = ''
    speechError.value = playbackError.message
  })
}

function stopTranslationPlayback() {
  speechPlaybackRequestId += 1
  stopSpeaking()
  speechPreparing.value = false
  speechPlaying.value = false
  speechError.value = ''
  speechStatus.value = 'Playback stopped.'
}

onBeforeUnmount(() => {
  isMounted = false
  clearTimeout(translationTimer)
  clearTimeout(copyTimer)
  clearTimeout(recognitionRestartTimer)
  translationRequestId += 1
  speechPlaybackRequestId += 1
  stopSpeaking()
  recognition?.stop()
  releaseMicrophone()
})
</script>

<template>
  <div class="page-heading translator-heading">
    <div>
      <p class="eyebrow">Your words, understood</p>
      <h1>Live translator</h1>
      <p>Speak naturally. Your translation will appear here.</p>
    </div>
    <span class="pill translator-service-pill">
      <span class="dot" :class="{ 'service-connected-dot': serviceConnected }"></span>
      {{ serviceConnected ? 'Translation service connected' : 'Translation service' }}
    </span>
  </div>

  <section class="card translator-card voice-translator" aria-label="Voice translator">
    <div class="translator-top">
      <LanguageSelector v-model="sourceLanguage" label="I speak" :exclude="targetLanguage" />
      <button class="swap-button" type="button" aria-label="Swap languages" @click="swapLanguages">
        <ArrowLeftRight :size="19" aria-hidden="true" />
      </button>
      <LanguageSelector v-model="targetLanguage" label="Translate to" :exclude="sourceLanguage" />
    </div>

    <div class="voice-stage" :class="{ 'is-listening': listening }">
      <div class="voice-stage-copy">
        <span class="voice-step">01 <span>·</span> SPEAK</span>
        <h2>{{ listening ? 'I’m listening…' : 'What would you like to say?' }}</h2>
        <p>{{ listening ? `Speak in ${languageNames[sourceLanguage]}. Tap Stop when you’re done.` : 'Tap the microphone and say a phrase to translate.' }}</p>
      </div>

      <button
        class="voice-mic-button"
        :class="{ listening }"
        type="button"
        :disabled="!supported || requestingPermission"
        :aria-label="listening ? 'Stop listening' : 'Start listening'"
        :aria-pressed="listening"
        @click="toggleListening"
      >
        <span class="voice-mic-rings" aria-hidden="true"></span>
        <Mic :size="34" :stroke-width="2.1" aria-hidden="true" />
      </button>

      <div class="voice-controls">
        <button
          class="button button-primary voice-control-button"
          type="button"
          :disabled="!supported || listening || requestingPermission"
          @click="startVoiceTranslation"
        >
          <Mic :size="18" aria-hidden="true" />
          {{ requestingPermission ? 'Allow microphone…' : 'Start listening' }}
        </button>
        <button
          class="button button-secondary voice-control-button"
          type="button"
          :disabled="!listening"
          @click="stopVoiceTranslation"
        >
          Stop listening
        </button>
      </div>

      <p class="voice-recording-status" :class="{ active: listening || requestingPermission }" role="status" aria-live="polite">
        <span class="recording-indicator" aria-hidden="true"></span>
        {{ requestingPermission ? 'Waiting for microphone permission' : listening ? 'Microphone is on · Speak now' : 'Microphone is off' }}
      </p>
      <div v-if="listening" class="microphone-meter" :class="{ 'has-signal': microphoneHasSignal }">
        <span>{{ !microphoneMeterAvailable ? 'Microphone input monitor unavailable' : microphoneHasSignal ? 'Microphone is receiving sound' : 'Speak to test microphone input' }}</span>
        <div
          class="microphone-meter-track"
          role="meter"
          aria-label="Microphone input level"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="microphoneLevel"
        >
          <span :style="{ width: `${microphoneLevel}%` }"></span>
        </div>
      </div>
      <p v-if="!supported" class="voice-support-note" role="status">
        Voice recognition is not supported in this browser. You can still type a phrase below.
      </p>
    </div>

    <div class="voice-results">
      <article class="voice-result-card">
        <div class="voice-result-heading">
          <div>
            <span class="voice-step">02 <span>·</span> YOUR WORDS</span>
            <h3>{{ languageNames[sourceLanguage] }} speech</h3>
          </div>
          <span class="voice-result-language">{{ input.length }} / 3000</span>
        </div>
        <label class="sr-only" for="translator-input">Your phrase in {{ languageNames[sourceLanguage] }}</label>
        <textarea
          id="translator-input"
          v-model="input"
          class="translation-input voice-text-input"
          maxlength="3000"
          placeholder="Your recognized speech will appear here"
          spellcheck="false"
          autocomplete="off"
          aria-describedby="translator-input-help"
        ></textarea>
        <p id="translator-input-help" class="voice-input-help">Speech is transcribed automatically. Typing is optional.</p>
      </article>

      <article class="voice-result-card voice-translation-card">
        <div class="voice-result-heading">
          <div>
            <span class="voice-step">03 <span>·</span> TRANSLATION</span>
            <h3>{{ targetLanguageName }}</h3>
          </div>
          <span v-if="loading" class="translation-loading" aria-label="Translation in progress"></span>
        </div>
        <div class="voice-translation-output" aria-live="polite" :aria-busy="loading">
          {{ output || (loading ? 'Translating…' : 'Your translation will appear here.') }}
        </div>
        <div class="voice-translation-actions">
          <span class="voice-input-help">{{ output ? 'Translation from the connected service' : 'Waiting for your phrase' }}</span>
          <div class="action-group">
            <button class="icon-button voice-action-button" type="button" :disabled="speechPlaying || speechPreparing" aria-label="Play translation aloud" @click="playOutput">
              <Volume2 v-if="!speechPlaying && !speechPreparing" :size="17" aria-hidden="true" />
              <span v-else class="translation-loading" aria-hidden="true"></span>
            </button>
            <button v-if="speechPlaying || speechPreparing" class="icon-button voice-action-button" type="button" aria-label="Stop speech playback" @click="stopTranslationPlayback">
              <Square :size="15" aria-hidden="true" />
            </button>
            <button class="icon-button voice-action-button" type="button" :disabled="!output" :aria-label="copied ? 'Translation copied' : 'Copy translation'" @click="copyOutput">
              <Check v-if="copied" :size="17" aria-hidden="true" />
              <Copy v-else :size="17" aria-hidden="true" />
            </button>
          </div>
        </div>
        <p v-if="speechStatus" class="playback-status" role="status" aria-live="polite">{{ speechStatus }}</p>
        <p v-if="speechError" class="playback-status playback-error" role="alert">{{ speechError }}</p>
      </article>
    </div>

    <p v-if="status" class="status-line voice-status" role="status" aria-live="polite">{{ status }}</p>
    <p v-if="error" class="status-line error voice-status" role="alert">{{ error }}</p>
  </section>
</template>

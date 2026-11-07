<script setup>
import { ref } from 'vue'
import LanguageSelector from '../components/LanguageSelector.vue'
import MicrophoneButton from '../components/MicrophoneButton.vue'
import { isSpeechRecognitionSupported, startListening } from '../services/speechService'
import { translateText } from '../services/translationService'

const sourceLanguage = ref('en')
const targetLanguage = ref('es')
const draft = ref('')
const messages = ref([])
const listening = ref(false)
const busy = ref(false)
const error = ref('')
const speechSupported = isSpeechRecognitionSupported()
let recognition

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || busy.value) return
  draft.value = ''
  error.value = ''
  messages.value.push({ text, translated: '', mine: true })
  busy.value = true
  try {
    const result = await translateText({ text, sourceLanguage: sourceLanguage.value, targetLanguage: targetLanguage.value })
    messages.value[messages.value.length - 1].translated = result.translation
  } catch (requestError) {
    error.value = requestError.response?.data?.error || 'Could not translate this message. Check the translation service.'
    messages.value.pop()
    draft.value = text
  } finally {
    busy.value = false
  }
}

function listen() {
  if (listening.value) {
    recognition?.stop()
    return
  }
  try {
    recognition = startListening({
      language: sourceLanguage.value,
      onResult: (text) => { draft.value = text },
      onError: (speechError) => { error.value = speechError.message },
      onEnd: () => { listening.value = false },
    })
    listening.value = true
  } catch (speechError) {
    error.value = speechError.message
  }
}
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Better, together</p><h1>Conversation</h1><p>A shared space for a more natural back-and-forth.</p></div><span class="pill"><span class="dot"></span> Private session</span></div>
  <div class="conversation-layout">
    <section class="card conversation-main">
      <div class="conversation-toolbar">
        <div class="conversation-participants"><span class="avatar">TB</span><span>You and your conversation partner</span></div>
        <button class="button button-secondary" type="button" @click="messages = []; error = ''">New conversation</button>
      </div>
      <div class="conversation-feed" aria-live="polite">
        <div v-if="!messages.length" class="empty-state"><div class="empty-state-icon">↔</div><h3>Start with a simple hello</h3><p>Your translated messages will appear here.</p></div>
        <article v-for="(message, index) in messages" :key="index" class="message mine">
          {{ message.text }}
          <small v-if="message.translated">{{ message.translated }}</small>
          <small v-else-if="busy && index === messages.length - 1">Translating…</small>
        </article>
      </div>
      <form class="conversation-compose" @submit.prevent="sendMessage">
        <MicrophoneButton :listening="listening" :disabled="!speechSupported" @click="listen" />
        <input v-model="draft" class="field" placeholder="Write a message..." aria-label="Message" maxlength="3000" />
        <button class="button button-primary" type="submit" :disabled="busy || !draft.trim()">Send</button>
      </form>
      <p v-if="error" class="status-line error" role="alert">{{ error }}</p>
    </section>
    <aside class="card session-side">
      <p class="eyebrow">Language pair</p>
      <LanguageSelector v-model="sourceLanguage" label="You speak" :exclude="targetLanguage" />
      <div style="height: 14px"></div>
      <LanguageSelector v-model="targetLanguage" label="Your partner speaks" :exclude="sourceLanguage" />
      <div class="side-row" style="margin-top: 10px"><span>Session</span><strong>On this device</strong></div>
      <p class="setting-description">Messages are not saved when you leave this page.</p>
    </aside>
  </div>
</template>

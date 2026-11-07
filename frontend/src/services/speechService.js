const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function isSpeechRecognitionSupported() {
  return Boolean(Recognition)
}

export async function requestMicrophonePermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access requires a supported browser and a secure connection (HTTPS or localhost).')
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission was denied. Allow microphone access in your browser settings and try again.')
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No microphone was found. Connect a microphone and try again.')
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error('The microphone is busy or unavailable. Close other apps using it and try again.')
    }
    throw new Error('Could not access the microphone. Check your browser permissions and try again.')
  }
}

export function monitorMicrophone(stream, onLevel) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) {
    onLevel(null)
    return () => {}
  }

  const context = new AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 1024
  let source
  try {
    source = context.createMediaStreamSource(stream)
    source.connect(analyser)
  } catch {
    void context.close()
    onLevel(null)
    return () => {}
  }

  const samples = new Uint8Array(analyser.fftSize)
  let animationFrame
  let stopped = false

  const readLevel = () => {
    if (stopped) return
    analyser.getByteTimeDomainData(samples)
    let total = 0
    for (const sample of samples) {
      const amplitude = (sample - 128) / 128
      total += amplitude * amplitude
    }
    onLevel(Math.sqrt(total / samples.length))
    animationFrame = requestAnimationFrame(readLevel)
  }

  void context.resume().then(readLevel, () => {
    onLevel(null)
  })

  return () => {
    stopped = true
    cancelAnimationFrame(animationFrame)
    source.disconnect()
    if (context.state !== 'closed') void context.close()
  }
}

export function startListening({ language, onResult, onError, onEnd }) {
  if (!Recognition) throw new Error('Voice input is not supported in this browser.')

  const recognition = new Recognition()
  recognition.lang = language
  recognition.continuous = false
  recognition.interimResults = false
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript
    if (transcript) onResult(transcript)
  }
  recognition.onerror = (event) => {
    const messages = {
      'not-allowed': 'Microphone permission was denied. Allow microphone access in your browser settings and try again.',
      'service-not-allowed': 'The browser speech-recognition service is unavailable or blocked.',
      'no-speech': 'Speech recognition did not hear speech.',
      'audio-capture': 'No microphone is available to capture speech.',
      network: 'Speech recognition could not connect. Check your internet connection and try again.',
      'language-not-supported': 'Speech recognition does not support this language in your browser.',
      aborted: 'Speech recognition was stopped.',
    }
    const error = new Error(messages[event.error] || `Voice input failed: ${event.error}.`)
    error.code = event.error
    onError(error)
  }
  recognition.onend = onEnd
  recognition.start()
  return recognition
}

export function speakText(text, language) {
  if (!('speechSynthesis' in window)) throw new Error('Speech playback is not supported in this browser.')
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language
  window.speechSynthesis.speak(utterance)
}

const languages = {
  ar: 'Arabic',
  am: 'Amharic',
  bn: 'Bengali',
  bg: 'Bulgarian',
  ca: 'Catalan',
  zh: 'Chinese',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  el: 'Greek',
  ha: 'Hausa',
  he: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  ig: 'Igbo',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  rw: 'Kinyarwanda',
  rn: 'Kirundi',
  ko: 'Korean',
  lg: 'Luganda',
  mg: 'Malagasy',
  ms: 'Malay',
  om: 'Oromo',
  no: 'Norwegian',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sr: 'Serbian',
  sk: 'Slovak',
  es: 'Spanish',
  so: 'Somali',
  sn: 'Shona',
  st: 'Sesotho',
  sv: 'Swedish',
  sw: 'Swahili',
  tl: 'Tagalog',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  wo: 'Wolof',
  xh: 'Xhosa',
  yo: 'Yoruba',
  zu: 'Zulu',
}

const MAX_QUERY_LENGTH = 450
const REQUEST_TIMEOUT_MS = 15000
const languageCodes = { zh: 'zh-CN' }

class TranslationProviderError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TranslationProviderError'
    this.status = 502
  }
}

function splitIntoChunks(text) {
  const chunks = []
  let chunk = ''
  let chunkLength = 0

  for (const word of text.match(/\S+\s*/gu) || []) {
    const characters = Array.from(word)

    if (chunkLength + characters.length > MAX_QUERY_LENGTH && chunk) {
      chunks.push(chunk)
      chunk = ''
      chunkLength = 0
    }

    if (characters.length > MAX_QUERY_LENGTH) {
      if (chunk) chunks.push(chunk)
      while (characters.length > MAX_QUERY_LENGTH) {
        chunks.push(characters.splice(0, MAX_QUERY_LENGTH).join(''))
      }
      chunk = characters.join('')
      chunkLength = characters.length
    } else {
      chunk += word
      chunkLength += characters.length
    }
  }

  if (chunk) chunks.push(chunk)
  return chunks
}

function decodeHtmlEntities(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|#39);/giu, (entity, value) => {
    const namedEntities = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      '#39': "'",
    }

    if (value[0] !== '#') return namedEntities[value.toLowerCase()] || entity

    const codePoint = value[1].toLowerCase() === 'x'
      ? Number.parseInt(value.slice(2), 16)
      : Number.parseInt(value.slice(1), 10)

    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity
  })
}

async function translateChunk(text, sourceLanguage, targetLanguage) {
  const query = new URLSearchParams({
    q: text,
    langpair: `${languageCodes[sourceLanguage] || sourceLanguage}|${languageCodes[targetLanguage] || targetLanguage}`,
  })

  let response
  try {
    response = await fetch(`https://api.mymemory.translated.net/get?${query}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const message = error.name === 'TimeoutError' || error.name === 'AbortError'
      ? 'The translation provider took too long to respond'
      : 'Could not connect to the translation provider'
    throw new TranslationProviderError(message)
  }

  if (!response.ok) {
    throw new TranslationProviderError(`The translation provider returned HTTP ${response.status}`)
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new TranslationProviderError('The translation provider returned an invalid response')
  }

  if (result.responseStatus !== 200 || typeof result.responseData?.translatedText !== 'string') {
    throw new TranslationProviderError(result.responseDetails || 'The translation provider could not translate this text')
  }

  return decodeHtmlEntities(result.responseData.translatedText)
}

async function translate(text, sourceLanguage, targetLanguage) {
  const chunks = splitIntoChunks(text)
  const translations = []

  for (const chunk of chunks) {
    translations.push(await translateChunk(chunk, sourceLanguage, targetLanguage))
  }

  return translations.join('')
}

module.exports = { languages, translate, TranslationProviderError }

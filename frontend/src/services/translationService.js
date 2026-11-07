import api from './api'

export async function translateText({ text, sourceLanguage, targetLanguage }) {
  const { data } = await api.post('/translations', { text, sourceLanguage, targetLanguage })
  return data
}

const aiService = require('../services/aiService')

async function translate(req, res, next) {
  const { text, sourceLanguage, targetLanguage } = req.body || {}

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' })
  }

  if (text.trim().length > 3000) {
    return res.status(400).json({ error: 'Text must be 3000 characters or fewer' })
  }

  if (!Object.hasOwn(aiService.languages, sourceLanguage) || !Object.hasOwn(aiService.languages, targetLanguage)) {
    return res.status(400).json({ error: 'Choose supported source and target languages' })
  }

  if (sourceLanguage === targetLanguage) {
    return res.status(400).json({ error: 'Choose two different languages' })
  }

  try {
    const translation = await aiService.translate(text.trim(), sourceLanguage, targetLanguage)
    return res.json({
      translation,
      sourceLanguageName: aiService.languages[sourceLanguage],
      targetLanguageName: aiService.languages[targetLanguage],
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  translate,
}

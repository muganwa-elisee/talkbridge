const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const authRoutes = require('./routes/authRoutes')
const translationRoutes = require('./routes/translationRoutes')

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to TALKBRIDGE AI API',
    status: 'Running successfully',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/translations', translationRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.name === 'TranslationProviderError') {
    return res.status(err.status).json({ error: err.message })
  }
  res.status(err.status || 500).json({ error: 'Internal server error' })
})

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`TALKBRIDGE AI server running on port ${PORT}`)
})

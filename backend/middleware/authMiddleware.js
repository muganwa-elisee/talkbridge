const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const authorization = req.get('authorization')
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error('JWT_SECRET is not configured'))
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = requireAuth

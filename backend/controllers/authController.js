function notImplemented(_req, res) {
  res.status(501).json({ error: 'Authentication is not implemented yet' })
}

module.exports = {
  login: notImplemented,
  register: notImplemented,
}

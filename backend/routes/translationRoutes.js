const express = require('express')
const translationController = require('../controllers/translationController')

const router = express.Router()

router.post('/', translationController.translate)

module.exports = router

const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const foto = require('../controllers/foto.controller')

router.get('/getAll',
    foto.getFotos)

router.post('/new',
    foto.createFoto)

module.exports = router

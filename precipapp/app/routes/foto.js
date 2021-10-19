const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const foto = require('../controllers/foto.controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

router.get('/getAll',
    foto.getFotos)

router.post('/new',
    upload.single('z'),
    foto.createFoto)

module.exports = router

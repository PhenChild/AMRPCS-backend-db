const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const estacion = require('../controllers/estacion.controller')

router.get('/getAll',
  estacion.getEstaciones)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.createEstacion)

router.post('/update',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.updateEstacion)

module.exports = router

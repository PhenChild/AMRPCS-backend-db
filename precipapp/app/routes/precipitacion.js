const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const precipitacion = require('../controllers/precipitacion.controller')

router.get('/getAll',
precipitacion.getPrecipitaciones)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  precipitacion.newPrecipitaciones)

router.post('/disable',
[authJwt.verifyToken, authJwt.isAdmin],
precipitacion.disablePrecipitaciones)

module.exports = router

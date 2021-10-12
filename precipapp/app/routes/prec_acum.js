const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const acumulado = require('../controllers/prec_acum.controller')

router.get('/getAll',
  acumulado.getAcumulados)

router.post('/new',
  [authJwt.verifyToken, authJwt.isObserver],
  acumulado.newAcumulados)

router.post('/disable',
[authJwt.verifyToken, authJwt.isObserver],
acumulado.disableAcumulados)

module.exports = router

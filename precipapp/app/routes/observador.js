const { authJwt } = require('../middleware')
const express = require('express')
const router = express.Router()
const observador = require('../controllers/observador.controller')

router.get('/getAll',
  observador.getObservadores)

router.get(
  '/get',
  [authJwt.verifyToken],
  observador.getObservador
)

router.post(
  '/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  observador.createObservador)

router.get('/getEstacionObs',
  [authJwt.verifyToken, authJwt.isObserver],
  observador.getEstacionObs)
/*
router.get(
  '/getObsByEst/:codigo',
  [authJwt.verifyToken, authJwt.isAdmin],
  observador.getObservadoresPorEstacion)

router.post(
  '/update',
  [authJwt.verifyToken],
  observador.updateObserver)

router.post(
  '/updatePass',
  [authJwt.verifyToken],
  observador.updatePass)
*/
module.exports = router
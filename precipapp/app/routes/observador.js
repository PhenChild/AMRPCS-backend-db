const { authJwt } = require('../middleware')
const express = require('express')
const router = express.Router()
const observador = require('../controllers/observador.controller')

router.get('/getAll',
  [authJwt.verifyToken, authJwt.isAdmin],
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
/*
router.get(
  '/getObsByEst/:codigo',
  [authJwt.verifyToken, authJwt.isAdmin],
  observador.getObservadoresPorEstacion)

router.get('/getEstacionPorObs',
  [authJwt.verifyToken, authJwt.isObserver],
  observador.getEstacionPorObs)

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
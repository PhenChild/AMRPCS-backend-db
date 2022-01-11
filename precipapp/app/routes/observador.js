const { authJwt } = require('../middleware')
const express = require('express')
const router = express.Router()
const observador = require('../controllers/observador.controller')


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
router.get('/getEstacionObs',
  [authJwt.verifyToken, authJwt.isObserver],
  observador.getEstacionObs)

router.patch(
  '/update',
  [authJwt.verifyToken],
  observador.updateObserver)

router.patch(
  '/updatePass',
  [authJwt.verifyToken],
  observador.updatePass)

/*----------------------------------------------------
----------------------------------------------------*/

router.post('/getObsEstacion',
  observador.getObservadores)

  router.post('/getUserEstacion',
  [authJwt.verifyToken],
  observador.getUserEstaciones)

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
*/
module.exports = router
const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const { obsEstacion } = require('../middleware')
const acumulado = require('../controllers/prec_acum.controller')


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

router.post('/new',
  [authJwt.verifyToken, obsEstacion.obsByEst],
  acumulado.newAcumulados)

/*----------------------------------------------------
----------------------------------------------------*/
router.get('/getAll',
  acumulado.getAcumulados)

router.get('/getAll/filtro',
  acumulado.getFiltro)

router.post('/disable',
  [authJwt.verifyToken, authJwt.isObserver],
  acumulado.disableAcumulados)

router.post('/update',
  [authJwt.verifyToken, authJwt.isAdmin],
  acumulado.updateValor)

module.exports = router

const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const { obsEstacion } = require('../middleware')
const precipitacion = require('../controllers/precipitacion.controller')

/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
router.post('/new',
  [authJwt.verifyToken, obsEstacion.obsByEst],
  precipitacion.newPrecipitacion)


/*----------------------------------------------------
----------------------------------------------------*/

router.get('/getAll',
  precipitacion.getPrecipitaciones)

router.get('/getAll/filtro',
  [authJwt.verifyUser],
  precipitacion.getFiltro)

router.get('/getAll/filtroGrafico',
  precipitacion.getFiltroGrafico)

router.post('/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  precipitacion.disablePrecipitaciones)

router.post('/activate',
  [authJwt.verifyToken, authJwt.isAdmin],
  precipitacion.activatePrecipitaciones)

router.post('/update',
  [authJwt.verifyToken],
  precipitacion.updateValor)

module.exports = router

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
  [authJwt.verifyToken, authJwt.isAdmin],
  precipitacion.getFiltro)

router.get('/getAll/filtroGrafico',
  [authJwt.verifyToken, authJwt.isAdmin],
  precipitacion.getFiltroGrafico)

router.post('/disable',
  [authJwt.verifyToken, authJwt.isAdmin],
  precipitacion.disablePrecipitaciones)

module.exports = router

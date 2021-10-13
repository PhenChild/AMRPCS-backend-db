const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const precipitacion = require('../controllers/precipitacion.controller')

/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
router.post('/new',
  [authJwt.verifyToken, authJwt.isObserver],
  precipitacion.newPrecipitacion)


/*----------------------------------------------------
----------------------------------------------------*/

router.get('/getAll',
precipitacion.getPrecipitaciones)

router.post('/disable',
[authJwt.verifyToken, authJwt.isAdmin],
precipitacion.disablePrecipitaciones)

module.exports = router

const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const { obsEstacion } = require('../middleware')
const cuestionario = require('../controllers/cuestionario.controller')

/*----------------------------------------------------
          APP ENDPOINTS
----------------------------------------------------*/
router.post('/new',
  [authJwt.verifyToken, obsEstacion.obsByEst],
  cuestionario.newCuestionario)

/*----------------------------------------------------
----------------------------------------------------*/

router.get('/getAll',
  cuestionario.getCuestionarios)

router.post('/disable',
  [authJwt.verifyToken, authJwt.isAdmin],
  cuestionario.disableCuestionario)

module.exports = router

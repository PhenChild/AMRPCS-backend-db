const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const { obsEstacion } = require('../middleware')
const cuestionario = require('../controllers/cuestionario.controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

/*----------------------------------------------------
          APP ENDPOINTS
----------------------------------------------------*/
router.post('/new',
  upload.array('img', 4),
  cuestionario.newCuestionario)

/*----------------------------------------------------
----------------------------------------------------*/

router.get('/getAll',
  cuestionario.getCuestionarios)

router.post('/disable',
  [authJwt.verifyToken, authJwt.isAdmin],
  cuestionario.disableCuestionario)

module.exports = router

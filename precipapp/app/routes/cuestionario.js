const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const { obsEstacion } = require('../middleware')
const cuestionario = require('../controllers/cuestionario.controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

/*----------------------------------------------------S
          APP ENDPOINTS
----------------------------------------------------*/
router.post('/new',
  [upload.array('img', 4), authJwt.verifyToken, obsEstacion.obsByEst],
  cuestionario.newCuestionario)

/*----------------------------------------------------
----------------------------------------------------*/

router.post('/web/new',
  [authJwt.verifyToken, obsEstacion.obsByEst],
  cuestionario.newCuestionarioWeb)


router.post(
  '/web/newPicture',
  upload.single('file'),
  [authJwt.verifyToken],
  cuestionario.updateImage)


router.get('/getAll',
  cuestionario.getCuestionarios)

router.get('/getAll/filtro',
  [authJwt.verifyUser],
  cuestionario.getFiltro)

router.post('/update',
  [authJwt.verifyToken],
  cuestionario.updateCuestionario)

router.post('/activate',
  [authJwt.verifyToken, authJwt.isAdmin],
  cuestionario.activateCuestionario)

router.post('/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  cuestionario.disableCuestionario)

module.exports = router

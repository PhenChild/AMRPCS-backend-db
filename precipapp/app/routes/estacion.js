const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const estacion = require('../controllers/estacion.controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

router.get('/getAll',
  estacion.getEstaciones)

router.get('/getAll/filtro',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.getFiltro)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  upload.single('file'),
  estacion.createEstacion)

router.post('/update',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.updateEstacion)

  router.post('/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.disableEstacion)

module.exports = router

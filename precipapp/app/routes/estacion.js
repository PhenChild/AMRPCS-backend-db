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

router.get('/getAll/filtroSinDivision',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.getFiltroSinDivision)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.createEstacion)

router.post('/update',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.updateEstacion)

router.post(
  '/getPicture',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.adminGetImage)

router.post(
  '/getUpdateEstacion',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.getUpdateEstacion)

router.post(
  '/updatePicture',
  [authJwt.verifyToken, authJwt.isAdmin],
  upload.single('file'),
  estacion.updateEstacionImage)

router.post('/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.disableEstacion)

module.exports = router

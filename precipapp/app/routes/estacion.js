const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const estacion = require('../controllers/estacion.controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

router.get('/getAll',
  estacion.getEstaciones)

router.get('/getAll/filtro',
  [authJwt.verifyUser],
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
  estacion.adminGetImage)

router.post(
  '/getTipoRegistros',
  estacion.getTipoRegistros)

router.post(
  '/getHermanoEstaciones',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.getHermanoDivisiones)

router.post(
  '/updatePicture',
  [authJwt.verifyToken],
  upload.single('file'),
  estacion.updateEstacionImage)

router.post(
  '/activateEstacion',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.activateEstacion)

router.post('/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  estacion.disableEstacion)

module.exports = router

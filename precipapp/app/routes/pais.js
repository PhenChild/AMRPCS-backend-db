const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const pais = require('../controllers/pais.controller')

router.get('/get',
  pais.getAll)

router.get('/getAll/filtro',
  [authJwt.verifyToken, authJwt.isAdmin],
  pais.getFiltro)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  pais.newPais)

router.post('/update',
  [authJwt.verifyToken, authJwt.isAdmin],
  pais.updatePais)

router.post('/activatePais',
  [authJwt.verifyToken, authJwt.isAdmin],
  pais.activatePais)

router.post('/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  pais.disablePais)

module.exports = router

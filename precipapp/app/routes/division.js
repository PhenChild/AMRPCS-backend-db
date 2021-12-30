const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const division = require('../controllers/division.controller')

router.get('/getAll',
division.getDivisiones)

router.post('/getDivisionesPaisNivelOne',
[authJwt.verifyToken, authJwt.isAdmin],
division.getDivisionesPaisNivelOne)

router.post('/getDivisionesSuperiores',
[authJwt.verifyToken, authJwt.isAdmin],
division.getDivisionesDivisiones)

router.post('/getDivisionesInferiores',
[authJwt.verifyToken, authJwt.isAdmin],
division.getDivisionesInferiores)

router.post('/getDivisionesPais',
[authJwt.verifyToken, authJwt.isAdmin],
division.getDivisionesPais)

router.get('/getAll/filtro',
  [authJwt.verifyToken, authJwt.isAdmin],
  division.getFiltro)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  division.newDivision)

router.post('/update',
  [authJwt.verifyToken, authJwt.isAdmin],
  division.updateDivision)

router.post('/delete',
[authJwt.verifyToken, authJwt.isAdmin],
division.disableDivision)

module.exports = router

const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const division = require('../controllers/division.controller')

router.get('/getAll',
division.getDivisiones)

router.post('/getDivisionesSuperiores',
division.getDivisionesDivisiones)

router.post('/getDivisionesPais',
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

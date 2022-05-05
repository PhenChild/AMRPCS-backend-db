const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const ocupacion = require('../controllers/ocupacion.controller')

router.get('/getAll',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.getAll)

router.post('/getAllSector',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.getAllSector)

router.get('/getAll/filtro',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.getFiltro)

router.post('/new',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.newOcupacion)

router.post('/update',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.updateOcupacion)

router.post('/activate',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.activeOcupacion)

router.post('/delete',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.disableOcupacion)

module.exports = router

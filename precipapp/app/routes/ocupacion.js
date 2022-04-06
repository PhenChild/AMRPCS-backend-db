const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const ocupacion = require('../controllers/ocupacion.controller')

router.get('/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.getAll)

router.post('/new',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.newOcupacion)

router.post('/update',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.updateOcupacion)

router.post('/activateOcupacion',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.activeOcupacion)

router.post('/delete',
    [authJwt.verifyToken, authJwt.isAdmin],
    ocupacion.disableOcupacion)

module.exports = router

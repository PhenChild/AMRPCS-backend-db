const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const { obsEstacion } = require('../middleware')
const precex = require('../controllers/prec_ex.controller')

router.get('/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    precex.getAll)

router.get('/getAll/filtro',
    [authJwt.verifyUser],
    precex.getFiltro)

router.post('/new',
    [authJwt.verifyToken, obsEstacion.obsByEst],
    precex.newExtrema)

router.post('/update',
    [authJwt.verifyToken],
    precex.updateExtrema)

router.post('/activate',
    [authJwt.verifyToken, authJwt.isAdmin],
    precex.activeExtrema)

router.post('/delete',
    [authJwt.verifyToken, authJwt.isAdmin],
    precex.disableExtrema)

module.exports = router

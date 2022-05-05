const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const sector = require('../controllers/sector.controller')

router.get('/getAll',
    [authJwt.verifyToken, authJwt.isAdmin],
    sector.getAll)

module.exports = router

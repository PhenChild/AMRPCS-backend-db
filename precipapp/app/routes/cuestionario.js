const express = require('express')
const router = express.Router()
const { authJwt } = require('../middleware')
const cuestionario = require('../controllers/cuestionario.controller')

router.get('/getAll',
cuestionario.getCuestionarios)

router.post('/new',
  [authJwt.verifyToken, authJwt.isAdmin],
  cuestionario.newCuestionario)

router.post('/disable',
[authJwt.verifyToken, authJwt.isAdmin],
cuestionario.disableCuestionario)

module.exports = router

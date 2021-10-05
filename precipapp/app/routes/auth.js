const express = require('express')
const router = express.Router()
const { verifySignUp } = require('../middleware')
const auth = require('../controllers/auth.controller')
const { authJwt } = require('../middleware')

router.post('/signup', [
  authJwt.verifyToken,
  authJwt.isAdmin,
  verifySignUp.checkDuplicateEmail,
  verifySignUp.checkRoleExisted
],
auth.signup)

router.post('/signin', auth.signin)

router.post('/signinAdmin', [authJwt.isAdminByEmail],
  auth.signin)

router.post('/signinObs', [authJwt.isObserverByEmail],
  auth.signin)

module.exports = router

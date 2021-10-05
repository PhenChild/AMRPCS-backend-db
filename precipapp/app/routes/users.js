const express = require('express')
const router = express.Router()

const { authJwt } = require('../middleware')
const user = require('../controllers/user.controller')
const { verifySignUp } = require('../middleware')

router.get(
  '/getAll',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.getAll)
/*
router.get(
  '/delete/:userid',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.disableUser)

router.post('/updateUser',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.updateUser)

router.post('/updateRole',
  [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkRoleExisted],
  user.updateRole)
*/
module.exports = router
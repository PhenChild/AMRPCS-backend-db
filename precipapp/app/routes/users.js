const express = require('express')
const router = express.Router()

const { authJwt } = require('../middleware')
const user = require('../controllers/user.controller')
const { verifySignUp } = require('../middleware')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

router.get(
  '/getAll',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.getAll)

router.post(
  '/update',
  [authJwt.verifyToken, authJwt.isObserver],
  user.updateUser)


router.post(
  '/updateUserPass',
  [authJwt.verifyToken, authJwt.isObserver],
  user.updateUserPass)

router.post(
  '/update/picture',
  upload.single('foto'),
  user.updateImage)

router.get(
  '/getUserPicture',
  [authJwt.verifyToken, authJwt.isObserver],
  user.getImage)
  
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
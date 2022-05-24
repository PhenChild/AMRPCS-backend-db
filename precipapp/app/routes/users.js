const express = require('express')
const router = express.Router()

const { authJwt } = require('../middleware')
const user = require('../controllers/user.controller')
const { verifySignUp } = require('../middleware')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

router.get(
  '/getMe',
  [authJwt.verifyToken],
  user.getMe)

router.get(
  '/getAll',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.getAll)

router.post(
  '/update',
  [authJwt.verifyToken, authJwt.isObserver],
  user.updateUser)

// Actualizacion de datos de usuario desde administracion

router.post(
  '/user/update',
  [authJwt.verifyToken],
  user.updateSelfUser)

router.post(
  '/user/pass',
  [authJwt.verifyToken],
  user.updateSelfUserPass)

router.post(
  '/users/updateUser',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.updateUsers)

router.post(
  '/users/updatePass',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.adminUpdatePassUser)

router.post(
  '/user/getPicture',
  user.getImage)

router.post(
  '/user/updatePicture',
  [authJwt.verifyToken],
  upload.single('file'),
  user.updateImage)

router.post(
  '/users/getPicture',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.adminGetImage)

router.post(
  '/users/activateUser',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.activateUser)

router.post(
  '/users/updatePicture',
  [authJwt.verifyToken, authJwt.isAdmin],
  upload.single('file'),
  user.updateUserImage)

router.post(
  '/update/picture',
  upload.single('foto'),
  user.updateImageMovil)

router.post(
  '/updateUserPass',
  [authJwt.verifyToken, authJwt.isObserver],
  user.updateUserPass)

router.post(
  '/users/delete',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.deleteUser)

router.get(
  '/getUserPicture',
  [authJwt.verifyToken, authJwt.isObserver],
  user.getImageWeb)

router.get('/getAll/filtro',
  [authJwt.verifyUser],
  user.getFiltro)

router.post(
  '/users/updateUser',
  [authJwt.verifyToken, authJwt.isAdmin],
  user.updateUsers)

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
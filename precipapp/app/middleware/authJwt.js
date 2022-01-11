const jwt = require('jsonwebtoken')
const config = require('../../config/auth.config.js')
const db = require('../models')
const User = db.User
const Observer = db.Observador


/*----------------------------------------------------
                    GENERAL
----------------------------------------------------*/
// eslint-disable-next-line no-undef
verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    })
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!'
      })
    }
    req.userId = decoded.id
    next()
  })
}

verifyUser = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    req.userId = -1
    next()
  }
  else {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: 'Unauthorized!'
        })
      }
      req.userId = decoded.id
      next()
    })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/

/*----------------------------------------------------
                APP MIDDLEWARES
----------------------------------------------------*/
// eslint-disable-next-line no-undef
isObserver = (req, res, next) => {
  try {
    Observer.findOne({
      where: {
        idUser: req.userId,
        state: 'A'
      }
    }).then(obs => {
      if (!obs) {
        res.status(403).send({
          message: 'Require Observer Role!'
        })
      }
      next()
      return
    }).catch(err => { res.status(400).send({ message: err.message }) })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

// eslint-disable-next-line no-undef
isObserverByEmail = (req, res, next) => {
  try {
    const e = req.body.email
    User.findOne({
      where: {
        email: e,
        role: 'observer',
        state: 'A'
      }
    }).then(user => {
      // console.log(user);
      if (user) {
        req.userId = user.id
        next()
        return
      }
      res.status(403).send({
        message: 'Require Observer Role!'
      })
    }).catch(err => { res.status(400).send({ message: err.message }) })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/

// eslint-disable-next-line no-undef
isAdmin = (req, res, next) => {
  try {
    User.findOne({
      where: {
        id: req.userId,
        role: 'admin',
        state: 'A'
      }
    }).then(user => {
      if (user) {
        next()
        return
      }
      res.status(403).send({
        message: 'Require Admin Role!'
      })
    }).catch(err => { res.status(400).send({ message: err.message }) })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

// eslint-disable-next-line no-undef
isAdminByEmail = (req, res, next) => {
  try {
    console.log("Aquí ${req.body}")
    const e = req.body.email
    User.findOne({
      where: {
        email: e,
        role: 'admin',
        state: 'A'
      }
    }).then(user => {
      if (user) {
        req.userId = user.id
        next()
        return
      }
      res.status(403).send({
        message: 'Require Admin Role!'
      })
    }).catch(err => { res.status(400).send({ message: err.message }) })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const authJwt = {
  // eslint-disable-next-line no-undef
  verifyToken: verifyToken,
  // eslint-disable-next-line no-undef
  verifyUser: verifyUser,

  isAdmin: isAdmin,
  // eslint-disable-next-line no-undef
  isAdminByEmail: isAdminByEmail,
  // eslint-disable-next-line no-undef
  isObserverByEmail: isObserverByEmail,
  // eslint-disable-next-line no-undef
  isObserver: isObserver
}
module.exports = authJwt

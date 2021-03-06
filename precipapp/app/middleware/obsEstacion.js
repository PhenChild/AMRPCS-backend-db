const jwt = require('jsonwebtoken')
const config = require('../../config/auth.config.js')
const db = require('../models')
const User = db.User
const Observer = db.Observador

/*----------------------------------------------------
                APP MIDDLEWARES
----------------------------------------------------*/
// eslint-disable-next-line no-undef
obsByEst = (req, res, next) => {
    try {
      console.log(req)
      Observer.findOne({
        where: {
          idUser: req.userId,
          idEstacion: req.body.estacion,
          state: 'A'
        }
      }).then(obs => {
        if (obs) {
          req.obsId = obs.id
          next()
          return
        }
        res.status(403).send({
          message: 'Require Observer Role for this station!'
        })
      }).catch(err => { 
        console.log(err.message)
        res.status(400).send({ message: err.message }) })
    } catch (error) {
      console.log("edwin 2")
      res.status(400).send({ message: error.message })
    }
  }

  const obsEstacion = {
    // eslint-disable-next-line no-undef
    obsByEst: obsByEst
  }
  module.exports = obsEstacion
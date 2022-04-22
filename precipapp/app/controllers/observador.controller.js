const observer = require('../models').Observador
const estacion = require('../models').Estacion
const acumulados = require('../models').PrecAcum
const precipitacionesEx = require('../models').PrecEx
const precipitaciones = require('../models').Precipitacion
const cuestionarios = require('../models').Cuestionario
const user = require('../models').User
const estaciones = require('../models').Estacion
const divisiones = require('../models').Division
const Sequelize = require('../models')
const bcrypt = require('bcryptjs')
const Op = require('sequelize').Op


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
exports.getEstacionObs = async function (req, res, next) {
  try {
    await observer.findAll({
      where: { idUser: req.userId, state: 'A' },
      required: true,
      include: [{
        model: estacion, required: true, attributes: { exclude: ['foto'] }, where: {state: 'A'}
      }]
    }).then(obs => {
      console.log(obs)
      res.status(200).send(obs)
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateObserver = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const usr = await user.update(req.body, {
        where: { id: req.userId }
      }, { transaction: t })
      return usr
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updatePass = async function (req, res, next) {
  try {
    
    await Sequelize.sequelize.transaction(async (t) => {
      const usr = await user.findOne({
        where: { id: req.userId }
      }, { transaction: t }).then(usr => {
        const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          usr.password
        )
        if (!passwordIsValid) {
          return res.status(401).send({
            message: 'Invalid Old Password!'
          })
        }
        user.update({
          password: bcrypt.hashSync(req.body.newpassword, 8),
        }, {
          where: { id: req.userId }
        }, { transaction: t })
      }).catch(err => {
        res.status(400).send({ message: err.message })
      })
      return usr
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/

exports.getObservadores = async function (req, res, next) {
  try {
    await observer.findAll({
      where: { state: 'A' },
      required: true,
      include: [{
        model: user, attributes: { exclude: ['foto', 'password'] }, required: true
      }, {
        model: estacion, required: true, attributes: { exclude: ['foto'] }, where: {id: parseInt(req.body.id)}
      }]
    })
      .then(observadores => { 
        res.json(observadores)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getUserEstaciones = async function (req, res, next) {
  try {
    await observer.findAll({
      where: { idUser: req.body.id, state: 'A' },
      required: true,
      attributes: [],
      include: [{
        model: estacion, required: true, attributes: { exclude: ['foto'] }
      }]
    })
      .then(observadores => { 
        res.json(observadores)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getObservador = async function (req, res, next) {
  
  try {
    await observer.findOne({
      where: {
        idEstacion: req.body.estacion.id, attributes: {exclude: ['foto']},
        state: 'A'
      },
      attributes: ['id'],
      include: [{
        model: user, required: false, attributes: {exclude: ['password', 'foto']}
      }]
    })
      .then(obs => {
        if (!obs) {
          return res.status(400).send({ message: "there isn't an active observer for this user" })
        }
        res.json(obs)
      })
      .catch(err => res.status(400).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.createObservador = async (req, res) => {
  try {
    await observer.create({
      EstacionId: req.body.idEstacion,
      UserId: req.body.idUser
    }).then(obs => {
      res.send({ message: 'Observer succesfully created!' })
    })
      .catch(err => res.status(400).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.disableObserver = async function (req, res, next) {
  try {
    
    await Sequelize.sequelize.transaction(async (t) => {
      const obs = await observer.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return obs
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getMyReports = async function (req, res, next) {
  try {
    var datos = req.body
    
    var fI = datos.fechaInicio
    var fF
    if (!datos.fechaInicio) fI = new Date('December 17, 1995 03:24:00')
    if (!datos.fechaFin) fF = new Date(Date.now() + 82800000)
    else fF = datos.fechaFin
    var options = {
      where: { idObservador: req.obsId, state: "A" },
      required: true,
      include: [{
        model: observer, required: true, where: { state: 'A' }, include: [{
          model: user, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, state: 'A', attributes: []
          }]
        }]
      }]
    }
  
    if (datos.tipo == "acumulado") {
      if ((datos.fechaInicio || datos.fechaFin)) options = {
        where: { idObservador: req.obsId, fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
        required: true,
        include: [{
          model: observer, required: true, where: { state: 'A' }, include: [{
            model: user, required: true, attributes: ['id', 'nombre', 'apellido']
          }, {
            model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
              model: divisiones, required: true, state: 'A', attributes: []
            }]
          }]
        }]
      }
      var precsAcum = await acumulados.findAll(options)
      res.status(200).json(precsAcum)
      return
    }
  
    else if (datos.tipo == "precipitacion") {
      if ((datos.fechaInicio || datos.fechaFin)) options = {
        where: { idObservador: req.obsId, fecha: { [Op.between]: [fI, fF] }, state: "A" },
        required: true,
        include: [{
          model: observer, required: true, where: { state: 'A' }, include: [{
            model: user, required: true, attributes: ['id', 'nombre', 'apellido']
          }, {
            model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
              model: divisiones, required: true, state: 'A', attributes: []
            }]
          }]
        }]
      }
      var precs = await precipitaciones.findAll(options)
      res.status(200).json(precs)
      return
    }
  
    else if (datos.tipo == "extrema") {
      if ((datos.fechaInicio || datos.fechaFin)) options = {
        where: { idObservador: req.obsId, fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
        required: true,
        include: [{
          model: observer, required: true, where: { state: 'A' }, include: [{
            model: user, required: true, attributes: ['id', 'nombre', 'apellido']
          }, {
            model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
              model: divisiones, required: true, state: 'A', attributes: []
            }]
          }]
        }]
      }
      var precsEx = await precipitacionesEx.findAll(options)
      res.status(200).json(precsEx)
      return
    }
  
    else if (datos.tipo == "cuestionario") {
      if ((datos.fechaInicio || datos.fechaFin)) options = {
        where: { idObservador: req.obsId, fecha: { [Op.between]: [fI, fF] }, state: "A" },
        required: true,
        include: [{
          model: observer, required: true, where: { state: 'A' }, include: [{
            model: user, required: true, attributes: ['id', 'nombre', 'apellido']
          }, {
            model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
              model: divisiones, required: true, state: 'A', attributes: []
            }]
          }]
        }]
      }
      var cuest = await cuestionarios.findAll(options)
      res.status(200).json(cuest)
      return
    }
  }
  catch (error) {
    
    res.status(400).send({ message: error.message })
  }
}

/*
exports.getObservadoresPorEstacion = async (req, res) => {
  try {
    await observer.findAll({
      where: {
        EstacionCodigo: req.params.codigo,
        enable: true
      },
      attributes: ['id'],
      include: [{ model: user, required: true, attributes: ['nombre', 'apellido', 'email'] }]
    }).then(obs => {
      res.json(obs)
    })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
}*/

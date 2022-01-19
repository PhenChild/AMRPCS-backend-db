const paises = require('../models').Pais
const divisiones = require('../models').Division
const estacion = require('../models').Estacion
const observer = require('../models').Observador
const user = require('../models').User
const Sequelize = require('../models')
const Op = require('sequelize').Op

getUserRole = async function (req) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })
    if (u.role == 'admin') role = 'admin'
  }
  return role
}

getPaises = async function (options, req, res, next) {
  try {
    await paises.findAll(options)
      .then(paises => {
        res.json(paises)
      })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getAll = async function (req, res, next) {
  try {
    await paises.findAll({
      where: {
        state: 'A'
      }
    })
      .then(paises => {
        res.json(paises)
      })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getPaises = getPaises

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  var role = getUserRole(req)
  var options

  if (datos.nombre && datos.siglas) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, siglas: { [Op.iLike]: '%' + datos.siglas + '%' }, state: 'A' },
      attributes: ['nombre', 'siglas']
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, siglas: { [Op.iLike]: '%' + datos.siglas + '%' } }
    }
  }
  else if (datos.nombre) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, state: 'A' },
      attributes: ['nombre', 'siglas']
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' } }
    }
  }
  else if (datos.siglas) {
    if (role == 'observer') options = {
      where: { siglas: { [Op.iLike]: '%' + datos.siglas + '%' }, state: 'A' },
      attributes: ['nombre', 'siglas']
    }
    else options = {
      where: { siglas: { [Op.iLike]: '%' + datos.siglas + '%' } }
    }
  }
  else {
    if (role == 'observer') options = {
      where: { state: 'A' },
      attributes: ['nombre', 'siglas']
    }
    else options = {
      where: {}
    }
  }
  getPaises(options, req, res, next)
}

getPaisesNombre = async function (nombre, res, next) {
  try {
    await paises.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, state: 'A' }
    })
      .then(paises => {
        res.json(paises)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPaisesSiglas = async function (siglas, res, next) {
  try {
    await paises.findAll({
      where: { siglas: { [Op.iLike]: '%' + siglas + '%' }, state: 'A' }
    })
      .then(paises => {
        res.json(paises)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPaisesNombreSiglas = async function (nombre, siglas, res, next) {
  try {
    await paises.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, siglas: { [Op.iLike]: '%' + siglas + '%' }, state: 'A' }
    })
      .then(paises => {
        res.json(paises)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.newPais = async function (req, res, next) {
  try {
    console.log(req.body)
    await paises.create({
      nombre: req.body.nombre,
      siglas: req.body.siglas
    }).then(pais => {
      res.status(200).send({ message: 'Succesfully created' })
    }).catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updatePais = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const p = await paises.update({
        nombre: req.body.nombre,
        siglas: req.body.siglas,
        state: req.body.state
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return p
    }).catch(err => res.status(419).send({ message: err.message }))
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.disablePais = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const p = await paises.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      })
      console.log(p)
      var u = await user.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: {
          idPais: parseInt(req.body.id, 10)
        }
      })
      var us = await user.findAll({
        where: {
          idPais: parseInt(req.body.id, 10)
        }
      })
      console.log("usuarios eliminados")
      if (us[0]) {
        for (var a of us) {
          if (a.role == 'observer') {
            await observer.update({
              state: 'I',
              audDeletedAt: Date.now()
            }, {
              where: { idUser: a.id }
            })
          }
        }
      }
      console.log("observadores eliminados")
      await divisiones.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: { idPais: req.body.id }
      })
      var d = await divisiones.findAll({
        where: { idPais: req.body.id, nivel: 3 }
      })
      if (d[0]) {
        for (var division of d) {
          await estacion.update({
            state: 'I',
            audDeletedAt: Date.now()
          }, {
            where: { idUbicacion: division.id }, returning: true, plain: true
          })
          var estaciones = await estacion.findAll({
            where: { idUbicacion: division.id }
          })
          console.log(estaciones)
          if (estaciones[0]) {
            for (var e of estaciones) {
              await observer.update({
                state: 'I',
                audDeletedAt: Date.now()
              }, {
                where: { idEstacion: e.id }
              })
            }
          }
        }
      }
    }, {transaction: t})
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error.message })
  }
}

exports.activatePais = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      await paises.update({
        state: 'A'
      }, {
        where: { id: parseInt(req.body.id) }, returning: true, plain: true
      })

      res.status(200).send({ message: 'Succesfully Activated' })
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  }
  catch (error) {
    res.status(400).send({ message: error.message })
  }
}
const paises = require('../models').Pais
const divisiones = require('../models').Division
const Sequelize = require('../models')
const Op = require('sequelize').Op

getPaises = async function (req, res, next) {
  try {
    await paises.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] }
    })
      .then(paises => {
        res.json(paises)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getPaises = getPaises

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  if (datos.nombre) getPaisesNombre(datos.nombre, res, next)
  else if (datos.siglas) getPaisesSiglas(datos.siglas, res, next)
  else if (datos.nombre && datos.siglas) getPaisesNombreSiglas(datos.nombre, datos.siglas, res, next)
  else getPaises(req, res, next)

}

getPaisesNombre = async function (nombre, res, next) {
  try{
  await paises.findAll({
    where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }
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
  try{
  await paises.findAll({
    where: { siglas: {[Op.iLike]: '%' + siglas + '%'}, state: 'A' }
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
  try{
  await paises.findAll({
    where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, siglas: {[Op.iLike]: '%' + siglas + '%'}, state: 'A' }
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
      }, { transaction: t })
      console.log(p)
      var d = divisiones.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {where: {idPais: p.id}})
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const acumulados = require('../models').PrecAcum
const Sequelize = require('../models')
const observadores = require('../models').Observador
const usuarios = require('../models').User
const estaciones = require('../models').Estacion
const Op = require('sequelize').Op


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

exports.newAcumulados = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      await acumulados.create({
        fechaInicio: Date.parse(req.body.fechaInicio),
        fechaFin: Date.parse(req.body.fechaFin),
        valor: parseFloat(req.body.valor),
        comentario: req.body.comentario,
        idObservador: parseInt(req.obsId)
      }, { transaction: t }).then(acum => {
        res.status(200).send({ message: 'Succesfully created' })
      })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/
getAcumulados = async function (req, res, next) {
  try {
    await acumulados.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getAcumulados = getAcumulados

/*
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
*/
exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  if (datos.observador) getAcumuladosObservador(datos.observador, res, next)
  else if (datos.estacion) getAcumuladosEstacion(datos.estacion, res, next)
  else if (datos.fechaInicio && datos.fechaFin) getAcumuladosFecha(datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.observador && datos.estacion) getAcumuladosObservadorEstacion(datos.observador, datos.estacion, res, next)
  else if (datos.estacion && datos.fechaInicio && datos.fechaFin) getAcumuladosEstacionFecha(datos.estacion, datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.observador && datos.fechaInicio && datos.fechaFin) getAcumuladosObservadorFecha(datos.observador, datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.observador && datos.estacion && datos.fechaInicio && datos.fechaFin) getAcumuladosObservadorEstacionFecha(datos.observador, datos.estacion, datos.fechaInicio, datos.fechaFin, res, next)
  else getAcumulados(req, res, next)

}

getAcumuladosObservador = async function (nombre, res, next) {
  try {
    await acumulados.findAll({
      where: { state: "A" },
      required: true,
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAcumuladosEstacion = async function (nombreEstacion, res, next) {
  try {
    await acumulados.findAll({
      where: { state: "A" },
      required: true,
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAcumuladosFecha = async function (fechaInicio, fechaFin, res, next) {
  try {
    await acumulados.findAll({
      where: { fecha_inicio: {[Op.between]: [fechaInicio, fechaFin]}, fecha_fin: {[Op.between]: [fechaInicio, fechaFin]}, state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAcumuladosObservadorEstacion = async function (nombre, nombreEstacion, res, next) {
  try {
    await acumulados.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAcumuladosEstacionFecha = async function (nombreEstacion, fechaInicio, fechaFin, res, next) {
  try {
    await acumulados.findAll({
      where: { fecha_inicio: {[Op.between]: [fechaInicio, fechaFin]}, fecha_fin: {[Op.between]: [fechaInicio, fechaFin]}, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAcumuladosObservadorFecha = async function (nombre, fechaInicio, fechaFin, res, next) {
  try {
    await acumulados.findAll({
      where: { fecha_inicio: {[Op.between]: [fechaInicio, fechaFin]}, fecha_fin: {[Op.between]: [fechaInicio, fechaFin]}, state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: false, where: { state: 'A' }, include: [{
          model: usuarios, required: false, where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }
        }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAcumuladosObservadorEstacionFecha = async function (nombre, nombreEstacion, fechaInicio, fechaFin, res, next) {
  try {
    await acumulados.findAll({
      where: { fecha_inicio: {[Op.between]: [fechaInicio, fechaFin]}, fecha_fin: {[Op.between]: [fechaInicio, fechaFin]}, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.disableAcumulados = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const a = await acumulados.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return a
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

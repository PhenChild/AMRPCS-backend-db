const precipitaciones = require('../models').Precipitacion
const observadores = require('../models').Observador
const usuarios = require('../models').User
const estaciones = require('../models').Estacion
const Sequelize = require('../models')
const Op = require('sequelize').Op


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
exports.newPrecipitacion = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      await precipitaciones.create({
        fecha: Date.parse(req.body.fecha),
        valor: parseFloat(req.body.valor),
        comentario: req.body.comentario,
        idObservador: parseInt(req.obsId)
      }, { transaction: t }).then(prec => {
        res.status(200).send({ message: 'Succesfully created' })
      })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/
getPrecipitaciones = async function (req, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: false, where: { state: 'A' }, include: [{
          model: usuarios, required: false, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']}, {
            model: estaciones, required: false, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
        }]
      }]
    })
      .then(precipitaciones => {
        console.log(precipitaciones)
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getPrecipitaciones = getPrecipitaciones

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
  if (datos.observador) getPrecipitacionesObservador(datos.observador, res, next)
  else if (datos.estacion) getPrecipitacionesEstacion(datos.estacion, res, next)
  else if (datos.fechaInicio && datos.fechaFin) getPrecipitacionesFecha(datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.observador && datos.estacion) getPrecipitacionesObservadorEstacion(datos.observador, datos.estacion, res, next)
  else if (datos.estacion && datos.fechaInicio && datos.fechaFin) getPrecipitacionesObservadorFecha(datos.estacion, datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.observador && datos.fechaInicio && datos.fechaFin) getPrecipitacionesObservadorFecha(datos.observador, datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.observador && datos.estacion && datos.fechaInicio && datos.fechaFin) getPrecipitacionesNombreEstacionFecha(datos.observador, datos.estacion, datos.fechaInicio, datos.fechaFin, res, next)
  else getPrecipitaciones(req, res, next)

}

exports.getFiltroGrafico = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  if (datos.estacion) getPrecipitacionesEstacionGrafico(datos.estacion, res, next)
  else if (datos.fechaInicio && datos.fechaFin) getPrecipitacionesFechaGrafico(datos.fechaInicio, datos.fechaFin, res, next)
  else if (datos.estacion && datos.fechaInicio && datos.fechaFin) getPrecipitacionesEstacionFechaGrafico(datos.estacion, datos.fechaInicio, datos.fechaFin, res, next)
  else getPrecipitacionesGrafico(req, res, next)

}

getPrecipitacionesObservador = async function (nombre, res, next) {
  try {
    await precipitaciones.findAll({
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
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesEstacion = async function (nombreEstacion, res, next) {
  try {
    await precipitaciones.findAll({
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
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesFecha = async function (fechaInicio, fechaFin, res, next) {
  try {
    await precipitaciones.findAll({
      where: { fecha:  {[Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesObservadorEstacion = async function (nombre, nombreEstacion, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      required: true,
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesEstacionFecha = async function (nombreEstacion, fechaInicio, fechaFin, res, next) {
  try {
    await precipitaciones.findAll({
      where: { fecha:  {[Op.between]: [fechaInicio, fechaFin] }, state: "A" },
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
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesObservadorFecha = async function (nombre, fechaInicio, fechaFin, res, next) {
  try {
    await precipitaciones.findAll({
      where: { fecha:  {[Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      required: true,
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { nombre: parseInt(nombre), state: 'A' }
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesNombreEstacionFecha = async function (nombre, nombreEstacion, fechaInicio, fechaFin, res, next) {
  try {
    await precipitaciones.findAll({
      where: { fecha:  {[Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      required: true,
      attributes: { exclude: ['state'] },
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' }, state: 'A' 
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: ['id', 'nombre', 'codigo'] 
      }]
      }]
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

//Funciones para grafico

getPrecipitacionesGrafico = async function (req, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      required: true,
      order: [
          ['fecha', 'ASC']
      ],
      attributes: ['fecha', 'valor']
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesEstacionGrafico = async function (nombreEstacion, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      required: true,
      order: [
          ['fecha', 'ASC']
      ],
      attributes: ['fecha', 'valor'],
      include: [{
        model: observadores, required: true, where: { state: 'A' }, attributes: [], include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: []
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: [] 
      }]
      }]
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesFechaGrafico = async function (fechaInicio, fechaFin, res, next) {
  try {
    await precipitaciones.findAll({
      where: { fecha:  {[Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      order: [
          ['fecha', 'ASC']
      ],
      attributes: ['fecha', 'valor'],
      required: true
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesEstacionFechaGrafico = async function (nombreEstacion, fechaInicio, fechaFin, res, next) {
  try {
    await precipitaciones.findAll({
      where: { fecha:  {[Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      order: [
          ['fecha', 'ASC']
      ],
      required: true,
      attributes: ['fecha', 'valor'],
      include: [{
        model: observadores, required: true, where: { state: 'A' }, attributes: [], include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { nombre: {[Op.iLike]: '%' + nombreEstacion + '%'}, state: 'A' }, attributes: [] 
      }]
      }]
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.disablePrecipitaciones = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const p = await precipitaciones.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return p
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

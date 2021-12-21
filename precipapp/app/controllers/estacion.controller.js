const Sequelize = require('../models')
const pais = require('../models').Pais
const division = require('../models').Division
const Op = require('sequelize').Op

const estacion = require('../models').Estacion

getEstaciones = async function (req, res, next) {
  try{
  await estacion.findAll({
    where: { state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getEstaciones = getEstaciones

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  if (datos.nombre) getEstacionesNombre(datos.nombre, res, next)
  else if (datos.codigo) getEstacionesCodigo(datos.codigo, res, next)
  else if (datos.nombrePais) getEstacionesPais(datos.nombrePais, res, next)
  else if (datos.nombre && datos.codigo) getEstacionesCodigoNombre(datos.codigo, datos.nombre, res, next)
  else if (datos.nombre && datos.nombrePais) getEstacionesNombrePais(datos.nombre, datos.codigo, res, next)
  else if (datos.nombrePais && datos.codigo) getEstacionesCodigoPais(datos.codigo, datos.nombrePais, res, next)
  else if (datos.nombre && datos.nombrePais && datos.codigo) getEstacionesNombreCodigoPais(datos.nombre, datos.codigo, datos.nombrePais, res, next)
  else getEstaciones(req, res, next)

}

getEstacionesCodigo = async function (codigo, res, next) {
  try{
  await estacion.findAll({
    where: { codigo: {[Op.iLike]: '%' + codigo + '%'}, state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesNombre = async function (nombre, res, next) {
  try{
  await estacion.findAll({
    where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesPais = async function (nombrePais, res, next) {
  try{
  await estacion.findAll({
    where: { state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { nombre: {[Op.iLike]: '%' + nombrePais + '%'}, state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesCodigoNombre = async function (codigo, nombre, res, next) {
  try{
  await estacion.findAll({
    where: { codigo: {[Op.iLike]: '%' + codigo + '%'}, nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesNombrePais = async function (nombre, nombrePais, res, next) {
  try{
  await estacion.findAll({
    where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { nombre: nombrePais, state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesCodigoPais = async function (codigo, nombrePais, res, next) {
  try{
  await estacion.findAll({
    where: { codigo: {[Op.iLike]: '%' + codigo + '%'}, state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { nombre: nombrePais, state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesNombreCodigoPais = async function (nombre, codigo, nombrePais, res, next) {
  try{
  await estacion.findAll({
    where: { nombre: {[Op.iLike]: '%' + nombre + '%'}, codigo: {[Op.iLike]: '%' + codigo + '%'}, state: 'A' },
    include: [{
      model: division, required: false, where: { state: 'A' }, include: [{
        model: pais, required: false, where: { nombre: nombrePais, state: 'A' }
      }]
    }]
  })
    .then(estaciones => {
      res.json(estaciones)
    })
    .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.createEstacion = async function (req, res, next) {
  try{
  console.log(req.body)
  const point = { type: 'Point', coordinates: [parseFloat(req.body.latitud), parseFloat(req.body.longitud)] }
  await estacion.create({
    codigo: req.body.codigo,
    nombre: req.body.nombre,
    posicion: point,
    altitud: parseFloat(req.body.altitud),
    direccion: req.body.direccion,
    referencias: req.body.referencias,
    foto: Buffer.from(req.file.buffer),
    state: 'A',
    hasPluviometro: true, //cambiar
    idUbicacion: parseInt(req.body.ubicacion)
  }).then(variableEstacion => {
    res.status(200).send({ message: 'Succesfully created' })
  }).catch(err => res.status(419).send({ message: err.message }))
} catch (error) {
  res.status(400).send({ message: error.message })
}
}

exports.disableEstacion = async function (req, res, next) {
  
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const e = await estacion.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id) }, returning: true, plain: true
      })

      console.log(e)
      await observer.update({
        state: 'I'
      }, {
        where: { idEstacion: parseInt(req.body.id) }
      }).then(obs => {
        console.log(obs)
        if (obs !== 0) {
          console.log('ingreso al for')
          for (const o of obs) {
            user.update({
              role: 'user'
            }, {
              where: { id: o.idUser }
            })
          }
        }
      })
    res.status(200).send({ message: 'Succesfully deleted' })
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.updateEstacion = async function (req, res, next) {
  try {
    const point = { type: 'Point', coordinates: [req.body.latitud, req.body.longitud] }
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const est = await estacion.update({
        nombre: req.body.nombre,
        posicion: point,
        altitud: req.body.altitud,
        direccion: req.body.direccion,
        hasPluviometro: true,
        referencias: req.body.referencias,
        state: req.body.state,
        idUbicacion: 2
      }, {
        where: { id: parseInt(req.body.id) }
      }, { transaction: t })
        return est
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

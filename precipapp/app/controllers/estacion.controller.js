const Sequelize = require('../models')

const estacion = require('../models').Estacion

exports.getEstaciones = async function (req, res, next) {
  try{
  await estacion.findAll({
    where: { enable: true }
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
    referencia: req.body.referencia,
    state: req.body.state,
    idUbicacion: parseInt(req.body.idUbicacion)
  }).then(variableEstacion => {
    res.status(200).send({ message: 'Succesfully created' })
  }).catch(err => res.status(419).send({ message: err.message }))
} catch (error) {
  res.status(400).send({ message: error.message })
}
}
/*
exports.disableEstacion = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      console.log(req.params)
      const e = await estacion.update({
        enable: false
      }, {
        where: { codigo: req.params.codigo }, returning: true, plain: true
      }, { transaction: t })

      await observer.update({
        enable: false
      }, {
        where: { codigo: e[1].codigo }
      }, { transaction: t }).then(obs => {
        console.log(obs)
        if (obs !== 0) {
          console.log('ingreso al for')
          for (const o of obs) {
            user.update({
              role: 'user'
            }, {
              where: { id: o.UserId }
            }, { transaction: t })
          }
        }
      }).catch(err => {
        res.status(400).send({ message: err.message })
      })
      return e
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
    res.status(200).send({ message: 'Succesfully deleted' })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}
*/

exports.updateEstacion = async function (req, res, next) {
  try {
    console.log(req.body)
    const point = { type: 'Point', coordinates: [parseFloat(req.body.latitud), parseFloat(req.body.longitud)] }
    await Sequelize.sequelize.transaction(async (t) => {
      const est = await estacion.update({
        nombre: req.body.nombre,
        posicion: point,
        altitud: parseFloat(req.body.altitud),
        direccion: req.body.direccion,
        referencia: req.body.referencia,
        state: req.body.state
      }, {
        where: { id: req.body.id }
      }, { transaction: t }).catch(err => {
        res.status(400).send({ message: err.message })
      })
      return est
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
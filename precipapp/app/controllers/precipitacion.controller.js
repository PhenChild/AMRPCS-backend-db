const precipitaciones = require('../models').Precipitacion
const Sequelize = require('../models')


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
exports.getPrecipitaciones = async function (req, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] }
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}


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

exports.disablePrecipitaciones = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const p = await precipitaciones.update({
        state: "I"
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

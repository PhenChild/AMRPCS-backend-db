const cuestionarios = require('../models').Cuestionario
const Sequelize = require('../models')


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

exports.newCuestionario = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      await cuestionarios.create({
        fecha: Date.parse(req.body.fecha),
        respSuelo: req.body.rsuelo,
        respVeg: req.body.rveg,
        respPrec: req.body.rprec,
        respTempPrec: req.body.rtprec,
        respTemps: req.body.rtemps,
        respGana: req.body.rgana,
        comentario: req.body.comentario,
        idObservador: parseInt(req.obsId)
      }, { transaction: t }).then(cuest => {
        res.status(200).send({ id: cuest.id })
      })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/
exports.getCuestionarios = async function (req, res, next) {
  try {
    await cuestionarios.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] }
    })
      .then(cuestionarios => {
        res.json(cuestionarios)
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

exports.disableCuestionario = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const c = await cuestionarios.update({
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

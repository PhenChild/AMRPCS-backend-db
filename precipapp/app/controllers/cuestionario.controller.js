const cuestionarios = require('../models').cuestionario
const Sequelize = require('../models')

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

exports.newCuestionario = async function (req, res, next) {
  try{
  console.log(req.body)
  await cuestionarios.create({
    fecha: Date.parse(req.body.fecha),
    resp_suelo: req.body.rsuelo,
    resp_veg: req.body.rveg,
    resp_prec: req.body.rprec,
    resp_temp_prec: req.body.rtprec,
    resp_temps: req.body.rtemps,
    resp_gana: req.body.rgana,
    comentario: req.body.comentario,
    idObserver: parseInt(req.body.idObserver)
  }).then(pais => {
    res.status(200).send({ message: 'Succesfully created' })
  }).catch(err => res.status(419).send({ message: err.message }))
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

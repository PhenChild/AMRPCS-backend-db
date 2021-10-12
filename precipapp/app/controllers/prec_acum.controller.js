const acumulados = require('../models').PrecAcum
const Sequelize = require('../models')

exports.getAcumulados = async function (req, res, next) {
  try {
    await acumulados.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] }
    })
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.newAcumulados = async function (req, res, next) {
  try{
  console.log(req.body)
  await acumulados.create({
    fecha_inicio: Date.parse(req.body.fechaInicio),
    fecha_fin: Date.parse(req.body.fechaFin),
    valor: parseInt(req.body.valor),
    comentario: req.body.comentario,
    idObservador: parseInt(req.body.idObservador)
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

exports.disableAcumulados = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const a = await acumulados.update({
        state: "I"
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

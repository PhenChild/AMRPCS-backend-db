const divisiones = require('../models').Division
const Sequelize = require('../models')

exports.getDivisiones = async function (req, res, next) {
  try {
    await divisiones.findAll({
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

exports.newDivision = async function (req, res, next) {
  try{
  console.log(req.body)
  await divisiones.create({
    idPais: parseInt(req.body.idPais),
    idPadre: parseInt(req.body.idPadre),
    nombre: req.body.nombre,
    nivel: req.body,nivel,
    state: "a"
  }).then(division => {
    res.status(200).send({ message: 'Succesfully created' })
  }).catch(err => res.status(419).send({ message: err.message }))
} catch (error) {
  res.status(400).send({ message: error.message })
}
}

exports.updateDivision = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const d = await divisiones.update({
        nombre: req.body.nombre,
        nivel: req.body.nivel,
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

exports.disableDivision = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const d = await divisiones.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return d
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const Sequelize = require('../models')
const user = require('../models').User
const observer = require('../models').Observador
const estacion = require('../models').Estacion

exports.getAll = async function (req, res, next) {
  try {
    await user.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state', 'password'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getImage = async function (req, res, next) {
  try {
    await user.findOne({
      where: { id: req.userId },
      attributes: ['foto']
    })
      .then(user => {
        res.contentType('image/jpeg');
        res.send(user.foto)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
/*
exports.disableUser = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        enable: false
      }, {
        where: { id: req.params.userid }, returning: true, plain: true
      }, { transaction: t })
      console.log(u)

      if (u[1].role == 'observer') {
        const obs = await observer.update({
          enable: false
        }, {
          where: { UserId: u[1].id }, returning: true, plain: true
        }, { transaction: t })

        if (obs) {
          await estacion.update({
            JefeId: null
          }, {
            where: { JefeId: obs[1].id }
          }, { transaction: t })
        }
      }
      return u
    })
    res.status(200).send({ message: 'Succesfully deleted' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
*/

exports.updateUser = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        email: req.body.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        telefono: req.body.telefono
      }, {
        where: {
          id: parseInt(req.body.id)
        },
        returning: true,
        plain: true
      }, { transaction: t })
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.updateImage = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        foto: Buffer.from(req.file.buffer)
      }, {
        where: {
          id: parseInt(req.body.idUser)
        },
        returning: true,
        plain: true
      }, { transaction: t })
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    console.log(error.message)
    res.status(419).send({ message: error.message })
  }
}
const observer = require('../models').Observador
const estacion = require('../models').Estacion
const user = require('../models').User
const Sequelize = require('../models')
const bcrypt = require('bcryptjs')


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
exports.getEstacionObs = async function (req, res, next) {
  try {
    await observer.findOne({
      where: { id: req.obsId },
      attributes: [],
      include: {
        model: estacion, required: true, attributes: ['codigo', 'nombre',
          'posicion', 'altitud', 'direccion', 'referencias'], as: 'Estacion'
      }
    }).then(obs => {
      var json = {
        codigo: obs.Estacion.codigo,
        nombre: obs.Estacion.nombre,
        latitud: obs.Estacion.posicion.coordinates[0],
        longitud: obs.Estacion.posicion.coordinates[1],
        altitud: obs.Estacion.altitud,
        direccion: obs.Estacion.direccion,
        referencias: obs.Estacion.referencias
      }
      res.status(200).send(json)
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}


/*----------------------------------------------------
----------------------------------------------------*/

exports.getObservadores = async function (req, res, next) {
  try {
    await observer.findAll({
      where: { state: 'A' },
      include: [{
        model: user, required: false
      }, {
        model: estacion, required: false
      }]
    })
      .then(observadores => {
        res.json(observadores)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getObservador = async function (req, res, next) {
  try {
    await observer.findOne({
      where: {
        UserId: req.UserId,
        state: 'A'
      },
      attributes: ['id'],
      include: [{
        model: user, required: false, attributes: ['email', 'nombre', 'apellido', 'telefono']
      }]
    })
      .then(obs => {
        if (!obs) {
          return res.status(400).send({ message: "there isn't an active observer for this user" })
        }
        res.json(obs)
      })
      .catch(err => res.status(400).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
/*
exports.updateObserver = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const usr = await user.update(req.body, {
        where: { id: req.idUser }
      }, { transaction: t })
      return usr
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
*/
/*
exports.updatePass = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const usr = await user.findOne({
        where: { id: req.userId }
      }, { transaction: t }).then(usr => {
        const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          usr.password
        )
        if (!passwordIsValid) {
          return res.status(401).send({
            message: 'Invalid Old Password!'
          })
        }
        user.update({
          password: bcrypt.hashSync(req.body.newpassword, 8),
        }, {
          where: { id: req.userId }
        }, { transaction: t })
      }).catch(err => {
        res.status(400).send({ message: err.message })
      })
      return usr
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
*/

exports.createObservador = async (req, res) => {
  try {
    await observer.create({
      EstacionId: req.body.idEstacion,
      UserId: req.body.idUser,
      is_sequia: (req.body.sequia == 'true')
    }).then(obs => {
      res.send({ message: 'Observer succesfully created!' })
    })
      .catch(err => res.status(400).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}



/*
exports.getObservadoresPorEstacion = async (req, res) => {
  try {
    await observer.findAll({
      where: {
        EstacionCodigo: req.params.codigo,
        enable: true
      },
      attributes: ['id'],
      include: [{ model: user, required: true, attributes: ['nombre', 'apellido', 'email'] }]
    }).then(obs => {
      res.json(obs)
    })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}
}*/
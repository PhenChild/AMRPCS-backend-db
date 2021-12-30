const Sequelize = require('../models')
const user = require('../models').User
const observer = require('../models').Observador
const estacion = require('../models').Estacion
const pais = require('../models').Pais
const bcrypt = require('bcryptjs')
const Op = require('sequelize').Op

exports.getMe = async function (req, res, next) {
  try {
    await user.findOne({
      where: { id: req.userId, state: "A" },
      include: [{
        model: pais, required: false, attributes: ['nombre'], as: "Pais"
      }]
    })
      .then(user => {
        console.log(user)
        var json = {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          role: user.role,
          pais: user.Pais.nombre,
          foto: user.foto.toString('base64'),
        }
        res.json(json)
      })
      .catch(err => {
        console.log(err)
        res.status(419).send({ message: err.message })
      }
      )
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAll = async function (req, res, next) {
  try {
    await user.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getAll = getAll

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  if (datos.nombre) getUsuariosNombre(datos.nombre, res, next)
  else if (datos.correo) getUsuariosEmail(datos.correo, res, next)
  else if (datos.role) getUsuariosRol(datos.role, res, next)
  else if (datos.nombre && datos.correo) getUsuariosNombreEmail(datos.nombre, datos.correo, res, next)
  else if (datos.nombre && datos.role) getUsuariosNombreRol(datos.nombre, datos.rolel, res, next)
  else if (datos.correo && datos.role) getUsuariosRolEmail(datos.role, datos.correo, res, next)
  else if (datos.nombre && datos.correo && datos.role) getUsuariosNombreRolEmail(datos.nombre, datos.correo, datos.role, res, next)
  else getAll(req, res, next)

}

getUsuariosNombre = async function (nombre, res, next) {
  try {
    await user.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosRol = async function (role, res, next) {
  try {
    await user.findAll({
      where: { role: role, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosEmail = async function (correo, res, next) {
  try {
    await user.findAll({
      where: { email: { [Op.iLike]: '%' + correo + '%' }, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombreRol = async function (nombre, role, res, next) {
  try {
    await user.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, role: role, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombreEmail = async function (nombre, correo, res, next) {
  try {
    await user.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, email: { [Op.iLike]: '%' + correo + '%' }, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosRolEmail = async function (role, correo, res, next) {
  try {
    await user.findAll({
      where: { role: role, email: { [Op.iLike]: '%' + correo + '%' }, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}


getUsuariosNombreRolEmail = async function (nombre, role, correo, res, next) {
  try {
    await user.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, role: role, email: { [Op.iLike]: '%' + correo + '%' }, state: "A" },
      attributes: { exclude: ['state', 'password', 'foto'] }
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
          id: parseInt(req.userId)
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

exports.updateSelfUser = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      if (parseInt(req.body.id) == req.userId) {
        var u = await user.update({
          email: req.body.email,
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          telefono: req.body.telefono
        }, {
          where: {
            id: parseInt(req.userId)
          },
          returning: true,
          plain: true
        }, { transaction: t })
        res.status(200).send({ message: 'Succesfully updated' })
      }
      else
        res.status(400).send({ message: 'Incorrect User' })
    })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.updateSelfUserPass = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      if (parseInt(req.body.id) == req.userId) {
        const u = await user.update({
          password: bcrypt.hashSync(req.body.password, 8)
        }, {
          where: {
            id: parseInt(req.userId)
          },
          returning: true,
          plain: true
        }, { transaction: t })
        res.status(200).send({ message: 'Succesfully updated' })
      }
      else
        res.status(400).send({ message: 'Incorrect User' })
    })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.adminGetImage = async function (req, res, next) {
  try {
    await user.findOne({
      where: { id: req.body.id },
      attributes: ['foto']
    })
      .then(user => {
        res.json({ foto: user.foto.toString('base64') })
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateUserPass = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        password: bcrypt.hashSync(req.body.newpassword, 8)
      }, {
        where: {
          id: parseInt(req.userId)
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

exports.updateUserImage = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        foto: Buffer.from(req.file.buffer)
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
    console.log(error.message)
    res.status(419).send({ message: error.message })
  }
}

exports.updateUsers = async function (req, res, next) {
  try {
    console.log(req.body)
    console.log(req.body.addedEstaciones)
    console.log(req.body.deletedEstaciones)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        email: req.body.usuario.email,
        nombre: req.body.usuario.nombre,
        apellido: req.body.usuario.apellido,
        telefono: req.body.usuario.telefono,
        idPais: parseInt(req.body.usuario.idPais)
      }, {
        where: {
          id: parseInt(req.body.usuario.id)
        },
        returning: true,
        plain: true
      }, { transaction: t })

      if (req.body.addedEstaciones[0]) {
        for (var a of req.body.addedEstaciones) {
          var o = await observer.findAll({ where: { idEstacion: parseInt(a.id), idUser: parseInt(req.body.usuario.id), state: 'I' } })
          console.log("llllllllllllllllllllllllllllllll")
          console.log(o)
          if (o[0]) {
            observer.update({ state: 'A' }, { where: { id: o[0].id } })
          }
          else {
            observer.create({
              idEstacion: parseInt(a.id),
              idUser: parseInt(req.body.usuario.id)
            })
          }
        }
      }
      if (req.body.deletedEstaciones[0]) {
        for (var a of req.body.deletedEstaciones) {
          observer.update({
            state: "I",
            audDeletedAt: Date.now()
          }, {
            where: { idEstacion: parseInt(a.id), idUser: parseInt(req.body.usuario.id) }
          })
        }
      }
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.adminUpdatePassUser = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        password: bcrypt.hashSync(req.body.password, 8)
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

exports.deleteUser = async function (req, res, next) {
  try {
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        state: 'I'
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
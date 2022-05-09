const Sequelize = require('../models')
const user = require('../models').User
const observer = require('../models').Observador
const ocupacion = require('../models').Ocupacion
const pais = require('../models').Pais
const sectores = require('../models').Sector
const bcrypt = require('bcryptjs')
const Op = require('sequelize').Op

exports.getMe = async function (req, res, next) {
  try {
    await user.findOne({
      where: { id: req.userId, state: "A" },
      include: [{
        model: pais, required: false, attributes: ['nombre'], as: "Pais"
      }, {
        model: ocupacion, required: false, attributes: ['id', 'descripcion']
      }]
    })
      .then(user => {
        var f = ''
        if (user.foto) f = user.foto.toString('base64')
        var json = {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          role: user.role,
          pais: user.Pais.nombre,
          ocupacion: (user.Ocupacion) ? user.Ocupacion.id: null,
          foto: f,
        }
        res.json(json)
      })
      .catch(err => {
        res.status(419).send({ message: err.message })
      })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getAll = async function (req, res, next) {
  var role = 'observer'
  var usuarios
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })

    if (u.role == 'admin') role = 'admin'
  }
  var options
  if (role == 'observer') {
    options = {
      where: { state: "A", role: role },
      attributes: ['nombre', 'apellido', 'role'], include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion']
      }]
    }
  }
  else {
    options = {
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion']
      }]
    }
  }
  await user.findAll(options)
    .then(user => {
      usuarios = user
    })
  res.json(usuarios)
}

module.exports.getAll = getAll

exports.getFiltro = async function (req, res, next) {
  var datos = req.query

  if (datos.nombre && datos.correo && datos.role && datos.pais) getUsuariosNombreRolEmailPais(datos.nombre, datos.role, datos.correo, datos.pais, res, next)
  else if (datos.nombre && datos.correo && datos.role) getUsuariosNombreRolEmail(datos.nombre, datos.role, datos.correo, res, next)
  else if (datos.nombre && datos.pais && datos.role) getUsuariosNombrePaisRol(datos.nombre, datos.pais, datos.role, res, next)
  else if (datos.pais && datos.correo && datos.role) getUsuariosPaisRolEmail(datos.pais, datos.role, datos.correo, res, next)
  else if (datos.nombre && datos.correo && datos.pais) getUsuariosNombreCorreoPais(datos.nombre, datos.correo, datos.pais, res, next)
  else if (datos.correo && datos.role) getUsuariosRolEmail(datos.role, datos.correo, res, next)
  else if (datos.nombre && datos.role) getUsuariosNombreRol(datos.nombre, datos.role, res, next)
  else if (datos.pais && datos.role) getUsuariosPaisRol(datos.pais, datos.role, res, next)
  else if (datos.nombre && datos.correo) getUsuariosNombreEmail(datos.nombre, datos.correo, req, res, next)
  else if (datos.nombre && datos.pais) getUsuariosNombrePais(datos.nombre, datos.pais, req, res, next)
  else if (datos.correo && datos.pais) getUsuariosCorreoPais(datos.correo, datos.pais, req, res, next)
  else if (datos.nombre) getUsuariosNombre(datos.nombre, req, res, next)
  else if (datos.correo) getUsuariosEmail(datos.correo, req, res, next)
  else if (datos.role) getUsuariosRol(datos.role, req, res, next)
  else if (datos.pais) getUsuariosPais(datos.pais, req, res, next)
  else getAll(req, res, next)

}

getUsuariosPaisRol = async function (pai, role, res, next) {
  try {
    await user.findAll({
      where: { role: role },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}


getUsuariosNombrePaisRol = async function (nombre, pai, role, res, next) {
  try {
    await user.findAll({
      where: { role: role, nombre: { [Op.iLike]: '%' + nombre + '%' } },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombreCorreoPais = async function (nombre, correo, pai, res, next) {
  try {
    await user.findAll({
      where: {
        nombre: { [Op.iLike]: '%' + nombre + '%' }, email: { [Op.iLike]: '%' + correo + '%' }
      },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosPaisRolEmail = async function (pai, role, correo, res, next) {
  try {
    await user.findAll({
      where: { role: role, email: { [Op.iLike]: '%' + correo + '%' } },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombrePais = async function (nombre, pai, req, res, next) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })

    if (u.role == 'admin') role = 'admin'
  }
  try {
    if (role == 'admin') {
      await user.findAll({
        where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }] },
        attributes: { exclude: ['password', 'foto'] }, include: [{
          model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion'],
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
    else {
      await user.findAll({
        where: { role: role, nombre: { [Op.iLike]: '%' + nombre + '%' }, state: "A" },
        attributes: ['nombre', 'apellido', 'role'], include: [{
          model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosCorreoPais = async function (email, pai, req, res, next) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })

    if (u.role == 'admin') role = 'admin'
  }
  try {
    if (role == 'admin') {
      await user.findAll({
        where: { email: { [Op.iLike]: '%' + email + '%' } },
        attributes: { exclude: ['password', 'foto'] }, include: [{
          model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion'],
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
    else {
      await user.findAll({
        where: { role: role, email: { [Op.iLike]: '%' + email + '%' }, state: "A" },
        attributes: ['nombre', 'apellido', 'role'], include: [{
          model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosPais = async function (pai, req, res, next) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })
    if (u.role == 'admin') role = 'admin'
  }
  try {
    if (role == 'admin') {
      await user.findAll({
        attributes: { exclude: ['password', 'foto'] }, include: [{
          model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion'],
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
    else {
      await user.findAll({
        where: { role: role, state: "A" },
        attributes: ['nombre', 'apellido', 'role'], include: [{
          model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombre = async function (nombre, req, res, next) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })
    if (u.role == 'admin') role = 'admin'
  }
  try {
    if (role == 'admin') {
      await user.findAll({
        where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }] },
        attributes: { exclude: ['password', 'foto'] }, include: [{
          model: pais, as: 'Pais', required: true, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion'],
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
    else {
      await user.findAll({
        where: { role: role, [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }], state: "A" },
        attributes: ['nombre', 'apellido', 'role'], include: [{
          model: pais, as: 'Pais', required: true, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosRol = async function (role, req, res, next) {
  try {
    await user.findAll({
      where: { role: role },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosEmail = async function (correo, req, res, next) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role'], include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
    if (u.role == 'admin') role = 'admin'
  }
  try {
    if (role == 'admin') {
      await user.findAll({
        where: { email: { [Op.iLike]: '%' + correo + '%' } },
        attributes: { exclude: ['password', 'foto'] }, include: [{
          model: pais, as: 'Pais', required: true, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
    else {
      await user.findAll({
        where: { role: role, email: { [Op.iLike]: '%' + correo + '%' }, state: "A" },
        attributes: ['nombre', 'apellido', 'role'], include: [{
          model: pais, as: 'Pais', required: true, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombreRol = async function (nombre, role, res, next) {
  try {
    await user.findAll({
      where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }], role: role },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombreEmail = async function (nombre, correo, req, res, next) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })

    if (u.role == 'admin') role = 'admin'
  }
  try {
    if (role == 'admin') {
      await user.findAll({
        where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }], email: { [Op.iLike]: '%' + correo + '%' } },
        attributes: { exclude: ['password', 'foto'] }, include: [{
          model: pais, as: 'Pais', required: true, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion'],
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
    else {
      await user.findAll({
        where: { role: role, nombre: { [Op.iLike]: '%' + nombre + '%' }, email: { [Op.iLike]: '%' + correo + '%' }, state: "A" },
        attributes: ['nombre', 'apellido', 'role'], include: [{
          model: pais, as: 'Pais', required: true, attributes: ['nombre']
        }, {
          model: ocupacion, required: false, attributes: ['descripcion']
        }]
      })
        .then(user => {
          res.json(user)
        })
        .catch(err => res.status(419).send({ message: err.message }))
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosRolEmail = async function (role, correo, res, next) {
  try {
    await user.findAll({
      where: { role: role, email: { [Op.iLike]: '%' + correo + '%' } },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
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
      where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }], role: role, email: { [Op.iLike]: '%' + correo + '%' } },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['descripcion']
        }
      }]
    })
      .then(user => {
        res.json(user)
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getUsuariosNombreRolEmailPais = async function (nombre, role, correo, pai, res, next) {
  try {
    await user.findAll({
      where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombre + '%' } }, { apellido: { [Op.iLike]: '%' + nombre + '%' } }], role: role, email: { [Op.iLike]: '%' + correo + '%' } },
      attributes: { exclude: ['password', 'foto'] }, include: [{
        model: pais, as: 'Pais', required: true, where: { nombre: { [Op.iLike]: '%' + pai + '%' } }, attributes: ['nombre']
      }, {
        model: ocupacion, required: false, attributes: ['descripcion'],
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }]
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
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        email: req.body.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        telefono: req.body.telefono,
        genero: req.body.genero
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
    console.log(error)
    res.status(419).send({ message: error.message })
  }
}

exports.updateSelfUser = async function (req, res, next) {
  try {

    await Sequelize.sequelize.transaction(async (t) => {
      if (parseInt(req.body.id) == req.userId) {
        var u = await user.update({
          email: req.body.email,
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          telefono: req.body.telefono,
          genero: req.body.genero,
          idOcupacion: parseInt(req.body.idOcupacion)
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
    res.status(419).send({ message: error.message })
  }
}

exports.updateUsers = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const u = await user.update({
        email: req.body.usuario.email,
        nombre: req.body.usuario.nombre,
        apellido: req.body.usuario.apellido,
        telefono: req.body.usuario.telefono,
        genero: req.body.usuario.genero,
        idOcupacion: parseInt(req.body.usuario.idOcupacion),
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

exports.getImage = async function (req, res, next) {
  try {
    await user.findOne({
      where: { id: req.body.id },
      attributes: ['foto']
    })
      .then(user => {
        if (user.foto) res.json({ foto: user.foto.toString('base64') })
        else res.json({ foto: '' })
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateImage = async function (req, res, next) {
  try {

    await Sequelize.sequelize.transaction(async (t) => {
      var u = await user.update({
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
    res.status(419).send({ message: error.message })
  }
}

exports.deleteUser = async function (req, res, next) {
  try {

    await Sequelize.sequelize.transaction(async (t) => {
      var u = await user.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: {
          id: parseInt(req.body.id)
        },
        returning: true,
        plain: true
      })

      if (u.role == 'observer') {
        await observer.update({
          state: 'I',
          audDeletedAt: Date.now()
        }, {
          where: { idUser: req.body.id }
        })
      }

    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.activateUser = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      await user.update({
        state: 'A'
      }, {
        where: { id: parseInt(req.body.id) }, returning: true, plain: true
      })

      res.status(200).send({ message: 'Succesfully Activated' })
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  }
  catch (error) {
    res.status(400).send({ message: error.message })
  }
}
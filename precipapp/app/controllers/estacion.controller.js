const Sequelize = require('../models')
const pais = require('../models').Pais
const division = require('../models').Division
const observadores = require('../models').Observador
const usuarios = require('../models').User
const precipitaciones = require('../models').Precipitacion
const acumulados = require('../models').PrecAcum
const cuestionarios = require('../models').Cuestionario
const user = require('../models').User
const Op = require('sequelize').Op
const estacion = require('../models').Estacion

getUserRole = async function (req) {
  var role = 'observer'
  if (!req.userId) {
    role = 'user'
  }
  else if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })
    if (u.role == 'admin') role = 'admin'
  }
  return role
}

exports.getInfoEstacion = async function (req, res) {
  try {
    var e = await estacion.findOne({
      where: { [Op.or]: [{ nombre: req.body.estacion }, { codigo: req.body.estacion }], state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { state: 'A' }
        }]
      }]
    })

    var d3
    var d2
    var d1
    d3 = await division.findOne({
      where: { id: e.idUbicacion, state: 'A' },
      required: true
    })
    d2 = await division.findOne({
      where: { id: d3.idPadre, state: 'A' },
      required: true
    })
    d1 = await division.findOne({
      where: { id: d2.idPadre, state: 'A' },
      required: true
    })

    var jsonEstacion = {
      nombre: e.nombre,
      Division: e.Division,
      altitud: e.altitud,
      codigo: e.codigo,
      direccion: e.direccion,
      hasPluviometro: e.hasPluviometro,
      idUbicacion: e.idUbicacion,
      posicion: e.posicion,
      referencias: e.referencias,
      division1: d1,
      division2: d2,
      division3: d3,
    }
    console.log(jsonEstacion)
    res.json(jsonEstacion)

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstaciones = async function (options, role, req, res, next) {
  try {
    var u
    if (role == 'observer') {
      u = await observadores.findAll({
        where: { idUser: req.userId, state: "A" },
        attributes: ['idEstacion']
      })
    }

    var estaciones = await estacion.findAll(options)

    var json = []
    for (var e of estaciones) {
      var d3
      var d2
      var d1
      if (role == 'observer' || role == 'user') {
        d3 = await division.findOne({
          where: { id: e.idUbicacion, state: 'A' },
          required: true
        })
        d2 = await division.findOne({
          where: { id: d3.idPadre, state: 'A' },
          required: true
        })
        d1 = await division.findOne({
          where: { id: d2.idPadre, state: 'A' },
          required: true
        })
      } else {
        d3 = await division.findOne({
          where: { id: e.idUbicacion },
          required: true
        })
        d2 = await division.findOne({
          where: { id: d3.idPadre },
          required: true
        })
        d1 = await division.findOne({
          where: { id: d2.idPadre },
          required: true
        })
      }

      var jsonEstacion = {
        nombre: e.nombre,
        Division: e.Division,
        altitud: e.altitud,
        codigo: e.codigo,
        direccion: e.direccion,
        hasPluviometro: e.hasPluviometro,
        id: e.id,
        idUbicacion: e.idUbicacion,
        posicion: e.posicion,
        referencias: e.referencias,
        division1: d1,
        division2: d2,
        division3: d3,
        audCreatedAt: e.audCreatedAt,
        audUpdatedAt: e.audUpdatedAt,
        state: e.state,
        itsMine: ''
      }
      if (role == 'observer' || role == 'user') {
        jsonEstacion.audCreatedAt = ''
        jsonEstacion.audUpdatedAt = ''
      }
      if (role == 'observer') {
        for (var o of u) {
          if (o.idEstacion == e.id) jsonEstacion.itsMine = true
        }
      }
      json.push(jsonEstacion)
    }

    res.json(json)

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getEstaciones = getEstaciones

getEstacionesSinDivision = async function (req, res, next) {
  try {
    await estacion.findAll({
      where: { state: 'A' },
      attributes: { exclude: ['foto'] }
    })
      .then(estaciones => {
        res.json(estaciones)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  var role = await getUserRole(req)
  var options
  if (datos.nombre && datos.nombrePais && datos.codigo) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' }, state: 'A' }
        }]
      }]
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' } },
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' } }
        }]
      }]
    }
  }
  else if (datos.nombrePais && datos.codigo) {
    if (role == 'observer') options = {
      where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' }, state: 'A' }
        }]
      }]
    }
    else options = {
      where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } },
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' } }
        }]
      }]
    }
  }
  else if (datos.nombre && datos.nombrePais) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' }, state: 'A' }
        }]
      }]
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' } },
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' } }
        }]
      }]
    }
  }
  else if (datos.nombre && datos.codigo) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { state: 'A' }
        }]
      }]
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' } },
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, include: [{
          model: pais, required: true
        }]
      }]
    }
  }
  else if (datos.nombre) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { state: 'A' }
        }]
      }]
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' } },
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, include: [{
          model: pais, required: true
        }]
      }]
    }
  }
  else if (datos.codigo) {
    if (role == 'observer') options = {
      where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { state: 'A' }
        }]
      }]
    }
    else options = {
      where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } },
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, include: [{
          model: pais, required: true
        }]
      }]
    }
  }
  else if (datos.nombrePais) {
    if (role == 'observer') options = {
      where: { state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' }, state: 'A' }
        }]
      }]
    }
    else options = {
      attributes: { exclude: ['foto'] },
      required: true,
      include: [{
        model: division, required: true, include: [{
          model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.nombrePais + '%' } }
        }]
      }]
    }
  }
  else {
    if (role == 'observer') options = {
      where: { state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      include: [{
        model: division, required: false, where: { state: 'A' }, include: [{
          model: pais, required: false, where: { state: 'A' }
        }]
      }]
    }
    else options = {
      attributes: { exclude: ['foto'] },
      include: [{
        model: division, required: false, include: [{
          model: pais, required: false
        }]
      }]
    }
  }

  getEstaciones(options, role, req, res, next)

}

exports.getFiltroSinDivision = async function (req, res, next) {
  var datos = req.query
  if (datos.nombre) getEstacionesNombreSinDivision(datos.nombre, res, next)
  else if (datos.codigo) getEstacionesCodigoSinDivision(datos.codigo, res, next)
  else if (datos.nombre && datos.codigo) getEstacionesCodigoNombre(datos.codigo, datos.nombre, res, next)
  else getEstacionesSinDivision(req, res, next)

}

getEstacionesCodigoSinDivision = async function (codigo, res, next) {
  try {
    await estacion.findAll({
      where: { codigo: { [Op.iLike]: '%' + codigo + '%' }, state: 'A' },
      attributes: { exclude: ['foto'] },
      required: true
    })
      .then(estaciones => {
        res.json(estaciones)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesNombreSinDivision = async function (nombre, res, next) {
  try {
    await estacion.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, state: 'A' },
      attributes: { exclude: ['foto'] },
      required: true
    })
      .then(estaciones => {
        res.json(estaciones)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesCodigoNombreSinDivision = async function (codigo, nombre, res, next) {
  try {
    await estacion.findAll({
      where: { codigo: { [Op.iLike]: '%' + codigo + '%' }, nombre: { [Op.iLike]: '%' + nombre + '%' }, state: 'A' },
      attributes: { exclude: ['foto'] },
      required: true
    })
      .then(estaciones => {
        res.json(estaciones)
      })
      .catch(err => res.json(err))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getEstacionesNombreCodigoPais = async function (nombre, codigo, nombrePais, res, next) {
  try {
    var estaciones = await estacion.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, codigo: { [Op.iLike]: '%' + codigo + '%' }, state: 'A' },
      attributes: { exclude: ['state', 'foto'] },
      required: true,
      include: [{
        model: division, required: true, where: { state: 'A' }, include: [{
          model: pais, required: true, where: { nombre: nombrePais, state: 'A' }
        }]
      }]
    })

    var json = []
    for (var e of estaciones) {
      var d3 = await division.findOne({
        where: { id: e.idUbicacion, state: 'A' },
        required: true
      })

      var d2 = await division.findOne({
        where: { id: d3.idPadre, state: 'A' },
        required: true
      })

      var d1 = await division.findOne({
        where: { id: d2.idPadre, state: 'A' },
        required: true
      })

      jsonEstacion = {
        nombre: e.nombre,
        Division: e.Division,
        altitud: e.altitud,
        codigo: e.codigo,
        direccion: e.direccion,
        hasPluviometro: e.hasPluviometro,
        id: e.id,
        idUbicacion: e.idUbicacion,
        posicion: e.posicion,
        referencias: e.referencias,
        division1: d1,
        division2: d2,
        division3: d3,
      }
      json.push(jsonEstacion)
    }

    res.json(json)

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.createEstacion = async function (req, res, next) {
  try {
    var e = await estacion.findOne({ where: { codigo: req.body.codigo } })
    if (e) {
      res.status(418).send({ message: 'Station already exists' })
      return
    }

    const point = { type: 'Point', coordinates: [parseFloat(req.body.latitud), parseFloat(req.body.longitud)] }
    await estacion.create({
      codigo: req.body.codigo,
      nombre: req.body.nombre,
      posicion: point,
      altitud: parseFloat(req.body.altitud),
      direccion: req.body.direccion,
      referencias: req.body.referencias,
      state: 'A',
      hasPluviometro: (req.body.hasPluviometro === 'true'),
      idUbicacion: parseInt(req.body.idUbicacion)
    }).then(variableEstacion => {
      res.status(200).send({ message: 'Succesfully created' })
    }).catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.adminGetImage = async function (req, res, next) {
  try {
    await estacion.findOne({
      where: { id: req.body.id },
      attributes: ['foto']
    })
      .then(estacion => {
        if (estacion.foto) res.json({ foto: estacion.foto.toString('base64') })
        else res.json({ foto: '' })
      })
      .catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateEstacion = async function (req, res, next) {
  try {
    const point = { type: 'Point', coordinates: [req.body.latitud, req.body.longitud] }
    await Sequelize.sequelize.transaction(async (t) => {
      const est = await estacion.update({
        nombre: req.body.nombre,
        posicion: point,
        altitud: req.body.altitud,
        direccion: req.body.direccion,
        hasPluviometro: (req.body.hasPluviometro === 'true'),
        referencias: req.body.referencias,
        idUbicacion: parseInt(req.body.idUbicacion)
      }, {
        where: { id: parseInt(req.body.id) }
      }, { transaction: t })
      res.status(200).send({ message: 'Succesfully updated' })
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateEstacionImage = async function (req, res, next) {
  try {
    var u = await user.findOne({
      where: {
        id: req.userId,
        state: 'A'
      }
    })

    await Sequelize.sequelize.transaction(async (t) => {
      if (u.role == 'admin') {
        var e = await estacion.update({
          foto: Buffer.from(req.file.buffer)
        }, {
          where: {
            id: parseInt(req.body.id)
          },
          returning: true,
          plain: true
        })
      }
      else {
        var obs = await observadores.findAll({
          where: { idUser: req.userId, state: "A" },
          attributes: ['idEstacion']
        })
        for (var o of obs) {
          if (o.idEstacion == parseInt(req.body.id)) {
            var e = await estacion.update({
              foto: Buffer.from(req.file.buffer)
            }, {
              where: {
                id: parseInt(req.body.id)
              },
              returning: true,
              plain: true
            })
          }
        }
      }
    })
    res.status(200).send({ message: 'Succesfully updated' })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.disableEstacion = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      await estacion.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id) }, returning: true, plain: true
      })

      await observadores.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: { idEstacion: parseInt(req.body.id) }
      })
      res.status(200).send({ message: 'Succesfully deleted' })
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  } catch (error) {
    res.status(419).send({ message: error.message })
  }
}

exports.getTipoRegistros = async function (req, res, next) {
  try {
    var jsonArr = []
    var prec = await precipitaciones.findAll({
      attributes: ['id'],
      required: true,
      include: [{
        model: observadores, required: true, where: { idEstacion: req.body.id }
      }]
    })
    if (prec[0]) {
      let json = {
        nombre: "Precipitación Diaria"
      }
      jsonArr.push(json)
    }

    var acum = await acumulados.findAll({
      attributes: ['id'],
      required: true,
      include: [{
        model: observadores, required: true, where: { idEstacion: req.body.id }
      }]
    })
    if (acum[0]) {
      let json = {
        nombre: "Precipitación Acumulada"
      }
      jsonArr.push(json)
    }
    var cues = await cuestionarios.findAll({
      attributes: ['id'],
      required: true,
      include: [{
        model: observadores, required: true, where: { idEstacion: req.body.id }
      }]
    })

    if (cues[0]) {
      let json = {
        nombre: "Percepción de Sequía (Mensual)"
      }
      jsonArr.push(json)
    }

    res.json(jsonArr)

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}


exports.getUsuariosPorEstaciones = async function (req, res, next) {
  try {
    var jsonArr = []
    for (var est of req.body.estaciones) {
      arr = []
      var e = await estacion.findOne({
        attributes: { exclude: ['foto', 'audCreatedAt', 'audDeletedAt', 'audUpdatedAt', 'id'] },
        where: { id: est.id },
        required: true,
        include: [{
          model: division, required: true, where: { state: 'A' }, include: [{
            model: pais, required: true, where: { state: 'A' }
          }]
        }]
      })

      var d3
      var d2
      var d1

      d3 = await division.findOne({
        where: { id: e.idUbicacion, state: 'A' },
        required: true
      })
      d2 = await division.findOne({
        where: { id: d3.idPadre, state: 'A' },
        required: true
      })
      d1 = await division.findOne({
        where: { id: d2.idPadre, state: 'A' },
        required: true
      })

      var jsonEstacion = {
        nombre: e.nombre,
        Division: e.Division,
        altitud: e.altitud,
        codigo: e.codigo,
        direccion: e.direccion,
        hasPluviometro: e.hasPluviometro,
        idUbicacion: e.idUbicacion,
        posicion: e.posicion,
        referencias: e.referencias,
        division1: d1,
        division2: d2,
        division3: d3,
        state: e.state,
        itsMine: ''
      }
      arr.push(jsonEstacion)
      var obs = await observadores.findAll({
        attributes: [],
        where: { idEstacion: est.id },
        required: true,
        include: [{
          model: usuarios, required: true, attributes: ["nombre", "apellido"]
        }]
      })
      var usersArr = []
      for (var o of obs) {
        json = { nombre: o.User.nombre + ' ' + o.User.apellido }
        usersArr.push(json)
      }
      arr.push(usersArr)
      jsonArr.push(arr)
    }
    res.json(jsonArr)

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getHermanoDivisiones = async function (req, res, next) {
  try {
    var json = []

    var d3 = await division.findOne({
      where: { id: req.body.idUbicacion, state: 'A' },
      required: true
    })

    var padre = await division.findOne({
      where: { id: d3.idPadre, state: 'A' },
      required: true
    })

    var ret = await division.findAll({
      where: { idPadre: padre.id, state: 'A' },
      required: true
    })

    res.json(ret)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.activateEstacion = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      var ubicacion = await division.findOne({
        where: {
          id: req.body.idUbicacion, state: 'A'
        }
      })
      if (ubicacion) {
        await estacion.update({
          state: 'A'
        }, {
          where: { id: parseInt(req.body.id) }, returning: true, plain: true
        })
        res.status(200).send({ message: 'Succesfully Activated' })
      }
      else res.status(418).send({ message: 'Ubicacion esta desactivada' })

    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  }
  catch (error) {
    res.status(400).send({ message: error.message })
  }
}
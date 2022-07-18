const divisiones = require('../models').Division
const pais = require('../models').Pais
const estacion = require('../models').Estacion
const observer = require('../models').Observador
const Sequelize = require('../models')
const Op = require('sequelize').Op

getUserRole = async function (req) {
  var role = 'observer'
  if (req.userId >= 0) {
    var u = await user.findOne({
      where: { id: req.userId, state: "A" },
      attributes: ['role']
    })
    if (u.role == 'admin') role = 'admin'
  }
  return role
}

getDivisiones = async function (options, role, req, res, next) {
  try {
    var resDivisiones = await divisiones.findAll(options)

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre
        if (role == 'observer') padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        else padre = await divisiones.findOne({
          where: { id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre
      arrayJson.push(datosDivision)
    }
    res.json(arrayJson)
    return
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getDivisiones = getDivisiones

exports.getFiltro = async function (req, res, next) {
  var datos = req.query

  var role = getUserRole(req)
  var options
  if (datos.nombre && datos.pais && datos.nivel) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, nivel: parseInt(datos.nivel), state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' }, state: 'A' }
      }]
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, nivel: parseInt(datos.nivel) },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' } }
      }]
    }
  }
  else if (datos.pais && datos.nivel) {
    if (role == 'observer') options = {
      where: { nivel: parseInt(datos.nivel), state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' }, state: 'A' }
      }]
    }
    else options = {
      where: { nivel: parseInt(datos.nivel) },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' } }
      }]
    }
  }
  else if (datos.nombre && datos.nivel) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, nivel: parseInt(datos.nivel), state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { state: 'A' }
      }]
    }
    else options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, nivel: parseInt(datos.nivel) },
      include: [{
        model: pais, required: true
      }]
    }
  }
  else if (datos.nombre && datos.pais) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' }, state: 'A' }
      }]
    }
    else options = {
      where: {
        nombre: { [Op.iLike]: '%' + datos.nombre + '%' }
      },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' } }
      }]
    }
  }
  else if (datos.nombre) {
    if (role == 'observer') options = {
      where: { nombre: { [Op.iLike]: '%' + datos.nombre + '%' }, state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { state: 'A' }
      }]
    }
    else options = {
      where: {
        nombre: { [Op.iLike]: '%' + datos.nombre + '%' }
      },
      include: [{
        model: pais, required: true
      }]
    }
  }
  else if (datos.pais) {
    if (role == 'observer') options = {
      where: { state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' }, state: 'A' }
      }]
    }
    else options = {
      include: [{
        model: pais, required: true, where: { nombre: { [Op.iLike]: '%' + datos.pais + '%' } }
      }]
    }
  }
  else if (datos.nivel) {
    if (role == 'observer') options = {
      where: { nivel: parseInt(datos.nivel), state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { state: 'A' }
      }]
    }
    else options = {
      where: { nivel: parseInt(datos.nivel) },
      include: [{
        model: pais, required: true
      }]
    }
  }
  else {
    if (role == 'observer') options = {
      where: { state: "A" },
      attributes: { exclude: ['state', 'audCreatedAt', 'audUpdatedAt'] },
      include: [{
        model: pais, required: true, where: { state: 'A' }
      }]
    }
    else options = {
      include: [{
        model: pais, required: true
      }]
    }
  }
  getDivisiones(options, role, req, res, next)

}

getDivisionesNombre = async function (nombre, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getDivisionesPais = async function (nombrePais, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { nombre: { [Op.iLike]: '%' + nombrePais + '%' }, state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getDivisionesNivel = async function (nivel, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { nivel: parseInt(nivel), state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getDivisionesNombreNivel = async function (nombre, nivel, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, nivel: parseInt(nivel), state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getDivisionesNombrePais = async function (nombre, nombrePais, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { nombre: { [Op.iLike]: '%' + nombrePais + '%' }, state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getDivisionesPaisNivel = async function (nombrePais, nivel, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { nivel: parseInt(nivel), state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { nombre: { [Op.iLike]: '%' + nombrePais + '%' }, state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getDivisionesNombrePaisNivel = async function (nombre, nombrePais, nivel, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { nombre: { [Op.iLike]: '%' + nombre + '%' }, nivel: parseInt(nivel), state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { nombre: { [Op.iLike]: '%' + nombrePais + '%' }, state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))

    var arrayJson = []
    for (p of resDivisiones) {
      let datosDivision = p.dataValues
      let nombrePadre
      if (!p.dataValues.idPadre) nombrePadre = '-'
      else {
        var padre = await divisiones.findOne({
          where: { state: "A", id: p.dataValues.idPadre }
        })
        nombrePadre = padre.nombre
      }
      datosDivision.nombrePadre = nombrePadre

      arrayJson.push(datosDivision)
    }

    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getDivisionesDivisiones = async function (req, res, next) {
  var nuevoNivel = parseInt(req.body.nivel) - 1
  if (nuevoNivel == 0) {
    res.json({})
  }
  else if (nuevoNivel == 2) {
    console.log("eddasd")
    try {
      var divs = await divisiones.findAll({
        where: { state: "A", idPais: parseInt(req.body.idPais), nivel: nuevoNivel },
        attributes: { exclude: ['state'] }
      })
      var arr = []
      for (var div of divs) {
        var divSuperior = await divisiones.findOne({
          where: { state: "A", id: div.idPadre, nivel: nuevoNivel - 1 }
        })
        var json = {
          id: div.id,
          idPadre: div.idPadre,
          nivel: div.nivel,
          nombre: divSuperior.nombre + ', ' + div.nombre
        }
        arr.push(json)
      }
      res.json(arr)
    } catch (error) {
      res.status(400).send({ message: error.message })
    }
  }
  else {
    try {
      await divisiones.findAll({
        where: { state: "A", idPais: parseInt(req.body.idPais), nivel: nuevoNivel },
        attributes: { exclude: ['state'] }
      })
        .then(divisiones => {

          res.json(divisiones)
        })
        .catch(err => res.json(err.message))
    } catch (error) {
      res.status(400).send({ message: error.message })
    }
  }
}


exports.getDivisionesInferiores = async function (req, res, next) {

  var nuevoNivel = parseInt(req.body.nivel) + 1
  if (nuevoNivel == 4) {
    res.json({})
  }
  else {
    try {
      await divisiones.findAll({
        where: { state: "A", idPadre: parseInt(req.body.id), nivel: nuevoNivel },
        attributes: { exclude: ['state'] }
      })
        .then(divisiones => {

          res.json(divisiones)
        })
        .catch(err => res.json(err.message))
    } catch (error) {
      res.status(400).send({ message: error.message })
    }
  }
}

exports.getDivisionesPaisNivelOne = async function (req, res, next) {

  try {
    await divisiones.findAll({
      where: { state: "A", idPais: parseInt(req.body.idPais), nivel: 1 },
      attributes: { exclude: ['state'] }
    })
      .then(divisiones => {
        res.json(divisiones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.getDivisionesPais = async function (req, res, next) {
  try {
    await divisiones.findAll({
      where: { state: "A", idPais: parseInt(req.body.idPais) },
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
  try {
    let ip
    if (parseInt(req.body.nivel) > 1) ip = parseInt(req.body.idPadre)
    else ip = null

    await divisiones.create({
      idPais: parseInt(req.body.idPais),
      idPadre: ip,
      nombre: req.body.nombre,
      nivel: parseInt(req.body.nivel),
      state: "A"
    }).then(division => {
      res.status(200).send({ message: 'Succesfully created' })
    }).catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateDivision = async function (req, res, next) {
  try {

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

    await Sequelize.sequelize.transaction(async (t) => {
      await divisiones.update({
        state: 'I',
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id) }
      })
      let nivel = parseInt(req.body.nivel)

      if (nivel == 3) {
        await estacion.update({
          state: 'I',
          audDeletedAt: Date.now()
        }, {
          where: { idUbicacion: parseInt(req.body.id) }, returning: true, plain: true
        })
        var estaciones = await estacion.findAll({
          where: { idUbicacion: parseInt(req.body.id) }
        })

        for (var e of estaciones) {
          await observer.update({
            state: 'I',
            audDeletedAt: Date.now()
          }, {
            where: { idEstacion: e.id }
          })
        }
      }

      else if (nivel == 2) {
        await divisiones.update({
          state: 'I',
          audDeletedAt: Date.now()
        }, {
          where: { idPadre: parseInt(req.body.id) }
        })
        var d = await divisiones.findAll({
          where: { idPadre: parseInt(req.body.id) }
        })
        for (var divi of d) {
          await estacion.update({
            state: 'I',
            audDeletedAt: Date.now()
          }, {
            where: { idUbicacion: divi.id }, returning: true, plain: true
          })
          var estaciones = await estacion.findAll({
            where: { idUbicacion: divi.id }
          })

          for (var e of estaciones) {
            await observer.update({
              state: 'I',
              audDeletedAt: Date.now()
            }, {
              where: { idEstacion: e.id }
            })
          }
        }
      }

      else if (nivel == 1) {
        await divisiones.update({
          state: 'I',
          audDeletedAt: Date.now()
        }, {
          where: { idPadre: parseInt(req.body.id) }
        })
        var d = await divisiones.findAll({
          where: { idPadre: parseInt(req.body.id) }
        })
        for (var divis of d) {
          await divisiones.update({
            state: 'I',
            audDeletedAt: Date.now()
          }, {
            where: { idPadre: divis.id }
          })
          var d = await divisiones.findAll({
            where: { idPadre: divis.id }
          })
          for (var divi of d) {
            await estacion.update({
              state: 'I',
              audDeletedAt: Date.now()
            }, {
              where: { idUbicacion: divi.id }, returning: true, plain: true
            })
            var estaciones = await estacion.findAll({
              where: { idUbicacion: divi.id }
            })

            for (var e of estaciones) {
              await observer.update({
                state: 'I',
                audDeletedAt: Date.now()
              }, {
                where: { idEstacion: e.id }
              })
            }
          }
        }
      }
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.activateDivision = async function (req, res, next) {
  try {

    await Sequelize.sequelize.transaction(async (t) => {

      var p = await pais.findOne({
        where: {
          id: parseInt(req.body.idPais)
        }
      })

      var d = await divisiones.findOne({
        where: {
          id: parseInt(req.body.idPadre),
          state: 'A'
        }
      })
      if (p && d) {
        await divisiones.update({
          state: 'A'
        }, {
          where: { id: parseInt(req.body.id) }, returning: true, plain: true
        })

        res.status(200).send({ message: 'Succesfully Activated' })
      }
      else res.status(418).send({ message: 'El Pais esta desactivada' })

    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  }
  catch (error) {
    res.status(400).send({ message: error.message })
  }
}
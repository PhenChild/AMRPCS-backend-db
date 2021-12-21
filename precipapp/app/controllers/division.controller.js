const divisiones = require('../models').Division
const pais = require('../models').Pais
const Sequelize = require('../models')
const Op = require('sequelize').Op

getDivisiones = async function (req, res, next) {
  try {
    var resDivisiones
    await divisiones.findAll({
      where: { state: "A" },
      attributes: { exclude: ['state'] },
      include: [{
        model: pais, required: false, where: { state: 'A' }
      }]
    })
      .then(divisiones => {
        resDivisiones = divisiones
      })
      .catch(err => res.json(err.message))
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
    res.json(arrayJson)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getDivisiones = getDivisiones

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  console.log(req.query)
  if (datos.nombre) getDivisionesNombre(datos.nombre, res, next)
  else if (datos.nombrePais) getDivisionesPais(datos.nombrePais, res, next)
  else if (datos.nivel) getDivisionesNivel(datos.nivel, res, next)
  else if (datos.nombre && datos.nombrePais) getDivisionesNombrePais(datos.nombre, datos.nombrePais, res, next)
  else if (datos.nombre && datos.nivel) getDivisionesNombreNivel(datos.nombre, datos.nivel, res, next)
  else if (datos.nombrePais && datos.nivel) getDivisionesPaisNivel(datos.nombrePais, datos.nivel, res, next)
  else if (datos.nombre && datos.nombrePais && datos.nivel) getDivisionesNombrePaisNivel(datos.nombre, datos.nombrePais, datos.nivel, res, next)
  else getDivisiones(req, res, next)

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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
    console.log(resDivisiones)
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
      console.log(padre)
      arrayJson.push(datosDivision)
    }
    console.log(arrayJson)
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
  else {
    try {
      await divisiones.findAll({
        where: { state: "A", idPais: parseInt(req.body.idPais), nivel: nuevoNivel },
        attributes: { exclude: ['state'] }
      })
        .then(divisiones => {
          console.log(divisiones)
          res.json(divisiones)
        })
        .catch(err => res.json(err.message))
    } catch (error) {
      res.status(400).send({ message: error.message })
    }
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
    console.log(req.body)
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

      var dhijos = divisiones.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: d.id }
      })

      if (dhijos[0]) {
        for (var a of dhijos) {
          divisiones.update({
            state: "I",
            audDeletedAt: Date.now()
          }, {
            where: { id: a.id }
          })
        }
      }
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const cuestionarios = require('../models').Cuestionario
const fotos = require('../models').Foto
const Sequelize = require('../models')


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

exports.newCuestionario = async function (req, res, next) {
  try {
    console.log(req)
    await Sequelize.sequelize.transaction(async (t) => {
      await cuestionarios.create({
        fecha: Date.parse(req.body.fecha),
        respSuelo: req.body.rsuelo,
        respVeg: req.body.rveg,
        respPrec: req.body.rprec,
        respTempPrec: req.body.rtprec,
        respTemps: req.body.rtemps,
        respGana: req.body.rgana,
        comentario: req.body.comentario,
        idObservador: req.obsId
        }, { transaction: t }).then(cuest => {
        
          if (req.files) {
          try {          
              for (const a of req.files) {
                fotos.create({
                idCuestionario: parseInt(cuest.id),
                foto: Buffer.from(a.buffer)
                })
              }
              res.status(200).send({ message: 'imagenes creadas' })
          }
          catch (error) {
            console.log(error.message)
            res.status(400).send({ message: error.message })
          }}
        })
    })
  } catch (error) {
    console.log(error.message)
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/
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
        state: "I",
        audDeletedAt: Date.now()
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

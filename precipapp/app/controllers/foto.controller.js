const fotos = require('../models').Foto
const Sequelize = require('../models')

exports.getFotos = async function (req, res, next) {
  try {
    await fotos.findAll({
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

exports.createFoto = async function (req, res, next) {
    try{
    console.log(req.files)
    await fotos.create({
      idCuestionario: parseInt(req.body.idCuestionario),
      foto: Buffer.from(req.file.buffer)
    }).then(foto => {
      res.status(200).send({ message: 'Succesfully created' })
    }).catch(err => res.status(419).send({ message: err.message }))
  } catch (error) {
    res.status(400).send({ message: error.message })
    }
  }

  exports.disableFoto = async function (req, res, next) {
    try {
      await Sequelize.sequelize.transaction(async (t) => {
        const f = await fotos.update({
          state: "I",
          audDeletedAt: Date.now()
        }, {
          where: { id: parseInt(req.body.id, 10) }
        }, { transaction: t })
        return f
      })
      res.status(200).send({ message: 'Succesfully disable' })
    } catch (error) {
      res.status(400).send({ message: error.message })
    }
  }
  
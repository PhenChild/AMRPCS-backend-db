const Sequelize = require('../models')
const Op = require('sequelize').Op
const sectores = require('../models').Sector

exports.getAll = async function (req, res, next) {
    try {
        await sectores.findAll()
            .then(ocupaciones => {
                res.json(ocupaciones)
            })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

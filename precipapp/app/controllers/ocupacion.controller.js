const Sequelize = require('../models')
const Op = require('sequelize').Op
const ocupaciones = require('../models').Ocupacion

exports.getAll = async function (req, res, next) {
    try {
        await ocupaciones.findAll({
            where: {
                state: 'A'
            }
        })
            .then(ocupaciones => {
                res.json(ocupaciones)
            })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.newOcupacion = async function (req, res, next) {
    try {
        console.log(req.body)
        await ocupaciones.create({
            trabajaActual: req.body.trabajo,
            ocupacionActual: req.body.ocupacion
        }).then(ocupacion => {
            res.status(200).send({ message: 'Succesfully created' })
        }).catch(err => res.status(419).send({ message: err.message }))
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.updateOcupacion = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await ocupaciones.update({
                trabajaActual: req.body.trabajo,
                ocupacionActual: req.body.ocupacion
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

exports.disableOcupacion = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await ocupaciones.update({
                state: 'I',
                audDeletedAt: Date.now()
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

exports.activeOcupacion = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await ocupaciones.update({
                state: 'A'
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

const precipitacionesEx = require('../models').PrecEx
const Sequelize = require('../models')
const Op = require('sequelize').Op

exports.newExtrema = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            await acumulados.create({
                fechaInicio: Date.parse(req.body.fechaInicio),
                fechaFin: Date.parse(req.body.fechaFin),
                valor: parseFloat(req.body.valor),
                comentario: req.body.comentario,
                exactitud: req.body.exactitud,
                inundacion: req.body.inundacion,
                eventos: req.body.eventos,
                idObservador: parseInt(req.obsId)
            }, { transaction: t }).then(acum => {
                res.status(200).send({ message: 'Succesfully created' })
            })
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.getAll = async function (req, res, next) {
    try {
        await precipitacionesEx.findAll({
            where: {
                state: 'A'
            }
        })
            .then(extremas => {
                res.json(extremas)
            })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.updateExtrema = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await precipitacionesEx.update({
                fechaInicio: Date.parse(req.body.fechaInicio),
                fechaFin: Date.parse(req.body.fechaFin),
                valor: parseFloat(req.body.valor),
                comentario: req.body.comentario,
                exactitud: req.body.exactitud,
                inundacion: req.body.inundacion,
                eventos: req.body.eventos,
                idObservador: parseInt(req.obsId)
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

exports.disableExtrema = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await precipitacionesEx.update({
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

exports.activeExtrema = async function (req, res, next) {
    try {
        console.log(req.body)
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await precipitacionesEx.update({
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

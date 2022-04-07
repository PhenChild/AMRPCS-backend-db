const precipitacionesEx = require('../models').PrecEx
const Sequelize = require('../models')
var nodemailer = require('nodemailer');
const Op = require('sequelize').Op

var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'micxarce@espol.edu.ec',
        pass: 'Garchomp_00'
    }
});

exports.newExtrema = async function (req, res, next) {
    try {
        console.log(req.body)
        console.log(req.obsId)
        await Sequelize.sequelize.transaction(async (t) => {
            await precipitacionesEx.create({
                fechaInicio: Date.parse(req.body.fechaInicio),
                fechaFin: Date.parse(req.body.fechaFin),
                valor: parseFloat(req.body.valor),
                comentario: req.body.comentario,
                exactitud: req.body.exactitud,
                inundacion: req.body.inundacion,
                eventos: req.body.eventos,
                granizo: req.body.granizo,
                deslizamiento: req.body.deslizamiento,
                idObservador: parseInt(req.obsId)
            }, { transaction: t }).then(acum => {
                if (req.body.notificacion) {
                    var mailOptions = {
                        from: 'micxarce@espol.edu.ec',
                        to: 'micharsie@yahoo.com',
                        subject: 'Sending Email using Node.js',
                        text: 'That was easy!'
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
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

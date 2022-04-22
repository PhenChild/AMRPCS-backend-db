const precipitacionesEx = require('../models').PrecEx
const observadores = require('../models').Observador
const usuarios = require('../models').User
const estaciones = require('../models').Estacion
const divisiones = require('../models').Division
const user = require('../models').User
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
        await Sequelize.sequelize.transaction(async (t) => {
            await precipitacionesEx.create({
                fecha: Date.parse(req.body.fecha),
                inundacion: parseInt(req.body.inundacion),
                granizo: parseInt(req.body.granizo),
                rayos: parseInt(req.body.rayos),
                deslizamiento: parseInt(req.body.deslizamiento),
                vientos: parseInt(req.body.vientos),
                comentario: req.body.comentario,
                isNotificacion: req.body.notificacion,
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
                            ;
                        } else {
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
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await precipitacionesEx.update({
                fecha: Date.parse(req.body.fecha),
                inundacion: parseInt(req.body.inundacion),
                granizo: parseInt(req.body.granizo),
                rayos: parseInt(req.body.rayos),
                deslizamiento: parseInt(req.body.deslizamiento),
                vientos: parseInt(req.body.vientos),
                isNotificacion: req.body.notificacion,
                comentario: req.body.comentario
            }, {
                where: { id: parseInt(req.body.id, 10) }
            }, { transaction: t })
            res.status(200).send({ message: 'Succesfully updated' })
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.disableExtrema = async function (req, res, next) {
    try {
        
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

getPrecipitacionesEx = async function (options, req, res, next) {
    try {
        await precipitacionesEx.findAll(options)
            .then(precipitaciones => {
                res.json(precipitaciones)
            })
            .catch(err => res.json(err.message))
    } catch (error) {
        
        res.status(400).send({ message: error.message })
    }
}

exports.getFiltro = async function (req, res, next) {
    var datos = req.query
    console.log(req.query)
    var fI = datos.fechaInicio
    var fF
    if (!datos.fechaInicio) fI = new Date('December 17, 1995 03:24:00')
    if (!datos.fechaFin) fF = new Date(Date.now() + 82800000)
    else fF = datos.fechaFin
    var role = getUserRole(req)
    
    console.log(fI)
    console.log(fF)
    
    var options
    if (datos.pais && datos.observador && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.pais && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.pais && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion && datos.pais && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion && datos.codigo && datos.pais) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, attributes: [], where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion && datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, attributes: [], where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: {},
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.pais && datos.estacion && datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: {},
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.pais && datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: {},
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion && datos.pais) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: {},
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.pais && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais), state: 'A' }, attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.codigo && datos.pais && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais), state: 'A' }, attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: {
                        codigo: { [Op.iLike]: '%' + datos.codigo + '%' }
                    }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.pais && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.codigo && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.observador && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.observador && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.pais && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.pais && datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.pais) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.estacion && datos.pais) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
                    }]
                }]
            }]
        }
    }
    else if (datos.observador && datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.estacion + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.estacion + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.estacion && datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.observador && datos.estacion) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.fechaInicio || datos.fechaFin) {
        if (role == 'observer ') options = {
            where: { fecha: { [Op.between]: [fI, fF] }, state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            where: { fecha: { [Op.between]: [fI, fF] } },
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.observador) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.codigo) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.estacion) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    else if (datos.pais) {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
                        model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, state: 'A', attributes: []
                    }]
                }]
            }]
        }
    }
    else {
        if (role == 'observer ') options = {
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            required: true,
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
        else options = {
            required: true,
            include: [{
                model: observadores, required: true, include: [{
                    model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        }
    }
    getPrecipitacionesEx(options, req, res, next)
}

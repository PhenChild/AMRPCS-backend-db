const precipitacionesEx = require('../models').PrecEx
const observadores = require('../models').Observador
const correos = require('../models').CorreoEmergencia
const usuarios = require('../models').User
const estaciones = require('../models').Estacion
const divisiones = require('../models').Division
const paises = require('../models').Pais
const user = require('../models').User
const Sequelize = require('../models')
var nodemailer = require('nodemailer');
const Op = require('sequelize').Op

exports.newExtrema = async function (req, res, next) {
    try {
        await Sequelize.sequelize.transaction(async (t) => {
            console.log(req.body)
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
            }, { transaction: t }).then(async (ex) => {
                if (req.body.notificacion) {
                    var obs = await observadores.findOne({
                        where: { state: 'A', id: parseInt(req.obsId) },
                        required: true,
                        include: {
                            model: usuarios, required: true, where: { state: 'A' }, attributes: ['nombre', 'apellido', 'email']
                        }
                    })
                    var est = await estaciones.findOne({
                        where: { id: parseInt(req.body.estacion) }
                    })
                    var division = await divisiones.findOne({
                        where: { id: est.idUbicacion }
                    })
                    var d2 = await divisiones.findOne({
                        where: { id: division.idPadre, state: 'A' },
                        required: true
                    })
                    var d1 = await divisiones.findOne({
                        where: { id: d2.idPadre, state: 'A' },
                        required: true
                    })

                    var pais = await paises.findOne({
                        where: { id: division.idPais, state: 'A' },
                        required: true
                    })

                    if (division.id) {
                        var text = `La estación ` + est.nombre + "(" + est.codigo + `) reporta un evento de precipitación extrema con las siguientes características:`
                            + "\n  - Fecha: " + ((req.body.fecha.slice(0, 20)).split('T')).join(' ')
                            + ((parseInt(req.body.inundacion) == 1) ? `\n   - Inundación` : "")
                            + ((parseInt(req.body.granizo) == 1) ? `\n   - Granizo` : "")
                            + ((parseInt(req.body.rayos) == 1) ? `\n   - Rayos` : "")
                            + ((parseInt(req.body.deslizamiento) == 1) ? `\n   - Deslizamientos` : "")
                            + ((parseInt(req.body.vientos) == 1) ? `\n   - Vientos Fuertes` : "")
                            + ((req.body.comentario) ? `\n   - Comentario: ` + req.body.comentario : "")
                            + `\nInformación de la estación:`
                            + `\n   - Nombre: ` + est.nombre + "(" + est.codigo + ")"
                            + `\n   - Ubicacion: ` + division.nombre + ", " + d2.nombre + ", " + d1.nombre + ", " + pais.nombre
                            + `\n   - Latitud: ` + est.posicion.coordinates[0]
                            + `\n   - Longitud: ` + est.posicion.coordinates[1] + " m.s.n.m."
                            + `\n   - Altitud: ` + est.altitud
                            + `\nInformación del usuario:`
                            + `\n   - Nombre: ` + obs.User.nombre + " " + obs.User.apellido
                            + `\n   - Correo: ` + obs.User.email
                        var correoss = await correos.findAll({
                            where: { state: 'A', idPais: division.idPais }
                        })
                        if (correoss[0]) for (var c of correoss) {
                            var transporter = nodemailer.createTransport({
                                service: 'outlook',
                                auth: {
                                    user: 'micxarce@espol.edu.ec',
                                    pass: 'Garchomp_00'
                                }
                            });

                            var mailOptions = {
                                from: 'micxarce@espol.edu.ec',
                                to: c.email,
                                subject: 'VOLUNCLIMA - ALERTA DE PRECIPITACIÓN EXTREMA - ' + est.nombre + "(" + est.codigo + ")",
                                text: text
                            };
                            await transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error)
                                }
                            });
                        }
                    }
                }
                res.status(200).send({ message: 'Succesfully created' })
            })
        })
    } catch (error) {
        console.log(error)
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
    var fI = datos.fechaInicio
    var fF
    if (!datos.fechaInicio) fI = new Date('December 17, 1995 03:24:00')
    if (!datos.fechaFin) fF = new Date(Date.now() + 82800000)
    else fF = datos.fechaFin
    var role = await getUserRole(req)

    var options
    if (datos.pais && datos.observador && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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
        if (role == 'observer') options = {
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

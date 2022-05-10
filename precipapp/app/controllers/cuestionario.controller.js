const cuestionarios = require('../models').Cuestionario
const fotos = require('../models').Foto
const Sequelize = require('../models')
const estaciones = require('../models').Estacion
const observadores = require('../models').Observador
const divisiones = require('../models').Division
const usuarios = require('../models').User
const user = require('../models').User
const Op = require('sequelize').Op

/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

exports.newCuestionario = async function (req, res, next) {
    try {
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
                        res.status(400).send({ message: error.message })
                    }
                }
            })
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

/*----------------------------------------------------
----------------------------------------------------*/

exports.newCuestionarioWeb = async function (req, res, next) {
    try {
        await Sequelize.sequelize.transaction(async (t) => {
            await cuestionarios.create({
                fecha: Date.parse(req.body.fecha),
                respSuelo: req.body.respSuelo,
                respVeg: req.body.respVeg,
                respPrec: req.body.respPrec,
                respTempPrec: req.body.respTempPrec,
                respTemps: req.body.respTemps,
                respGana: req.body.respGana,
                comentario: req.body.comentario,
                idObservador: req.obsId
            }, { transaction: t }).then(cues => {
                res.status(200).json({ id: cues.id })
            })
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.updateImage = async function (req, res, next) {
    try {
        await Sequelize.sequelize.transaction(async (t) => {
            await fotos.create({
                idCuestionario: parseInt(req.body.id),
                foto: Buffer.from(req.file.buffer)
            }, { transaction: t }).then(cues => {
                res.status(200).send({ message: 'Succesfully updated' })
            })
        })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.getCuestionarios = async function (req, res, next) {
    try {
        await cuestionarios.findAll({
            where: { state: "A" },
            attributes: { exclude: ['state'] },
            include: [{
                model: observadores, required: true, where: { state: 'A' }, include: [{
                    model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
                }, {
                    model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo']
                }]
            }]
        })
            .then(cuestionarios => {
                res.json(cuestionarios)
            })
            .catch(err => res.json(err.message))
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.updateCuestionario = async function (req, res, next) {
    try {
        await Sequelize.sequelize.transaction(async (t) => {
            var role = await getUserRole(req)
            if (role == "observer") {
                var obs = await observadores.findAll({
                    attributes: ["id"],
                    where: { idUser: req.userId }
                })
                var hasRecord = false;
                if (obs[0]) {
                    for (var o of obs) {
                        if (parseInt(req.body.idObservador) == o.id)
                            hasRecord = true;
                    }
                }
                if (!hasRecord) {
                    res.status(419).send({ message: "No pertenece" })
                    return
                }
            }
            const c = await cuestionarios.update({
                fecha: Date.parse(req.body.fecha),
                respSuelo: req.body.respSuelo,
                respVeg: req.body.respVeg,
                respPrec: req.body.respPrec,
                respTempPrec: req.body.respTempPrec,
                respTemps: req.body.respTemps,
                respGana: req.body.respGana,
                comentario: req.body.comentario,
                idObservador: req.obsId
            }, {
                where: { id: parseInt(req.body.id, 10) }
            })
            if (req.body.eliminados) {
                const f = await fotos.update({
                    state: "I",
                    audDeletedAt: Date.now()
                }, {
                    where: {
                        id: {
                            [Op.in]: req.body.eliminados
                        }
                    }
                })
            }
        })
        res.status(200).send({ message: 'Succesfully Activate' })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.activateCuestionario = async function (req, res, next) {
    try {

        await Sequelize.sequelize.transaction(async (t) => {
            const c = await cuestionarios.update({
                state: "A"
            }, {
                where: { id: parseInt(req.body.id, 10) }
            }, { transaction: t })
            return t
        })
        res.status(200).send({ message: 'Succesfully Activate' })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.disableCuestionario = async function (req, res, next) {
    try {

        await Sequelize.sequelize.transaction(async (t) => {
            const c = await cuestionarios.update({
                state: "I",
                audDeletedAt: Date.now()
            }, {
                where: { id: parseInt(req.body.id, 10) }
            }, { transaction: t })
            return t
        })
        res.status(200).send({ message: 'Succesfully disable' })
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

getCuestionarios = async function (options, req, res, next) {
    try {
        await cuestionarios.findAll(options)
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
                    model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' } }, attributes: ['id', 'nombre', 'codigo'], include: [{
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
    getCuestionarios(options, req, res, next)
}

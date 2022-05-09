const Sequelize = require('../models')
const Op = require('sequelize').Op
const ocupaciones = require('../models').Ocupacion
const sectores = require('../models').Sector

exports.getAll = async function (req, res, next) {
    try {
        await ocupaciones.findAll()
            .then(ocupaciones => {
                res.json(ocupaciones)
            })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.getAllSector = async function (req, res, next) {
    try {
        await ocupaciones.findAll({
            where: {idSector: parseInt(req.body.id)},
            include: {
              model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
            }
        }).then(ocupaciones => {
                res.json(ocupaciones)
            })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.newOcupacion = async function (req, res, next) {
    try {
        
        await ocupaciones.create({
            descripcion: req.body.descripcion,
            idSector: parseInt(req.body.sector)
        }).then(ocupacion => {
            res.status(200).send({ message: 'Succesfully created' })
        }).catch(err => res.status(419).send({ message: err.message }))
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

exports.updateOcupacion = async function (req, res, next) {
    try {
        
        await Sequelize.sequelize.transaction(async (t) => {
            const p = await ocupaciones.update({
                descripcion: req.body.descripcion,
                idSector: parseInt(req.body.sector)
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

getOcupaciones = async function (options, req, res, next) {
    try {
      await ocupaciones.findAll(options)
        .then(ocupaciones => {
          res.json(ocupaciones)
        })
    } catch (error) {
      res.status(400).send({ message: error.message })
    }
  }

exports.getFiltro = async function (req, res, next) {
    var datos = req.query
    
    var options
    if (datos.sector && datos.descripcion) {
        options = {
          where: { descripcion: { [Op.iLike]: '%' + datos.descripcion + '%' }, idSector: parseInt(datos.sector)},
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }
      }
    else if (datos.sector) {
        options = {
          where: { idSector: parseInt(datos.sector)},
          include: {
            model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
          }
        }
      }
    else if (datos.descripcion) {
      options = {
        where: { descripcion: { [Op.iLike]: '%' + datos.descripcion + '%' }},
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }
    }
    else {
      options = {
        where: { },
        include: {
          model: sectores, required: true, where: { state: 'A' }, attributes: ['id', 'descripcion']
        }
      }
    }
    getOcupaciones(options, req, res, next)
  }
  
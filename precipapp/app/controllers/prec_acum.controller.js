const acumulados = require('../models').PrecAcum
const Sequelize = require('../models')
const observadores = require('../models').Observador
const usuarios = require('../models').User
const estaciones = require('../models').Estacion
const divisiones = require('../models').Division
const Op = require('sequelize').Op


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

exports.newAcumulados = async function (req, res, next) {
  try {
    
    await Sequelize.sequelize.transaction(async (t) => {
      await acumulados.create({
        fechaInicio: Date.parse(req.body.fechaInicio),
        fechaFin: Date.parse(req.body.fechaFin),
        valor: parseFloat(req.body.valor),
        comentario: req.body.comentario,
        idObservador: parseInt(req.obsId)
      }, { transaction: t }).then(acum => {
        res.status(200).send({ message: 'Succesfully created' })
      })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

/*----------------------------------------------------
----------------------------------------------------*/

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


getAcumulados = async function (options, req, res, next) {
  try {
    await acumulados.findAll(options)
      .then(acumulados => {
        res.json(acumulados)
      })
      .catch(err => {
        
        res.json(err.message)
      })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getAcumulados = getAcumulados

/*
exports.updatePais = async function (req, res, next) {
  try {
    
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
exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  
  var fI = datos.fechaInicio
  var fF
  if (!datos.fechaInicio) fI = new Date('December 17, 1995 03:24:00')
  if (!datos.fechaFin) fF = new Date(Date.now() + 82800000)
  else fF = new Date(Date.parse(datos.fechaFin) + 82800000)
  var role = getUserRole(req)
  var options
  
  
  if (datos.pais && datos.observador && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      //where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: {
            codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
              model: divisiones, required: true, where: { idPais: parseInt(datos.pais) }, attributes: []
            }]
          }
        }]
      }]
    }
  }
  else if (datos.observador && datos.estacion && datos.pais && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.observador && datos.estacion && datos.codigo && datos.pais) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }] }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.observador && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
        model: observadores, required: true, where: { state: 'A' }, include: [{
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.pais && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.codigo && datos.pais && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais), state: 'A'}, attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }}, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.observador && datos.pais && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.codigo && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: datos.estacion, state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {state: 'A'}, attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: datos.estacion}, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {state: 'A'}, attributes: [] 
          }]
        }]
      }]
    }
  }
  else if (datos.pais && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
          }]
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, attributes: ['id', 'nombre', 'codigo'], include: [{
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, attributes: [] 
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF }, state: "A" },
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
      where: { fecha_inicio: { [Op.gte]: fI }, fecha_fin: { [Op.lte]: fF } },
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
            model: divisiones, required: true, where: {idPais: parseInt(datos.pais)}, state: 'A', attributes: [] 
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
  getAcumulados(options, req, res, next)
}

exports.updateValor = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      var role = await getUserRole(req)
      console.log(role)
      console.log(req.userId)
      if (role == "observer") {
        var obs = await observadores.findAll({
          attributes: ["id"],
          where: {idUser: req.userId}
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
      const prec = await acumulados.update({
        valor: parseFloat(req.body.valor),
        comentario: req.body.comentario
      }, {
        where: { id: parseInt(req.body.id) }
      }, { transaction: t })
      res.status(200).send({ message: 'Succesfully updated' })
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.disableAcumulados = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const a = await acumulados.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.activateAcumulados = async function (req, res, next) {
  try {
    
    await Sequelize.sequelize.transaction(async (t) => {
      const a = await acumulados.update({
        state: "A"
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return a
    })
    res.status(200).send({ message: 'Succesfully activate' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

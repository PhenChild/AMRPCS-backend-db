const acumulados = require('../models').PrecAcum
const Sequelize = require('../models')
const observadores = require('../models').Observador
const usuarios = require('../models').User
const estaciones = require('../models').Estacion
const Op = require('sequelize').Op


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/

exports.newAcumulados = async function (req, res, next) {
  try {
    console.log(req.body)
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
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getAcumulados = getAcumulados

/*
exports.updatePais = async function (req, res, next) {
  try {
    console.log(req.body)
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
  console.log(req.query)
  var fI = datos.fechaInicio
  var fF = datos.fechaFin
  if (!datos.fechaInicio) fI = new Date('December 17, 1995 03:24:00')
  else if (!datos.fechaFin) fF = Date.now()
  var role = getUserRole(req)
  var options
  if (datos.observador && datos.estacion && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
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
  else if (datos.codigo && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { attributes: ['id', 'nombre', 'apellido']}
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }}, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
  }
  else if (datos.observador && datos.codigo && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: {codigo: { [Op.iLike]: '%' + datos.codigo + '%' }}, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
  }
  else if (datos.observador && datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { nombre: { [Op.iLike]: '%' + datos.estacion + '%' }  }, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
  }
  else if (datos.observador && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }}, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
  }
  else if (datos.estacion && (datos.fechaInicio || datos.fechaFin)) {
    if (role == 'observer ') options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: {state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }], state: 'A' }, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' }}] }, attributes: ['id', 'nombre', 'codigo']
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
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.observador + '%' } }, { apellido: { [Op.iLike]: '%' + datos.observador + '%' } }] }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: {codigo: { [Op.iLike]: '%' + datos.estacion + '%' }}, attributes: ['id', 'nombre', 'codigo']
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
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: {  nombre: { [Op.iLike]: '%' + datos.estacion + '%' }, codigo: { [Op.iLike]: '%' + datos.codigo + '%' }}, attributes: ['id', 'nombre', 'codigo']
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
      attributes: { exclude: ['state'] },
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
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, where: { state: 'A' }, include: [{
          model: usuarios, required: true, where: {state: 'A' }, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { state: 'A' }, attributes: ['id', 'nombre', 'codigo']
        }]
      }]
    }
    else options = {
      where: { fecha_inicio: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] } },
      attributes: { exclude: ['state'] },
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
      attributes: { exclude: ['state'] },
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
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { codigo: { [Op.iLike]: '%' + datos.codigo + '%' }}, attributes: ['id', 'nombre', 'codigo']
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
      attributes: { exclude: ['state'] },
      required: true,
      include: [{
        model: observadores, required: true, include: [{
          model: usuarios, required: true, attributes: ['id', 'nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + datos.estacion + '%' } }]}, attributes: ['id', 'nombre', 'codigo']
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
      attributes: { exclude: ['state'] },
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
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
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
    console.log(req.body)
    await Sequelize.sequelize.transaction(async (t) => {
      const a = await acumulados.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return a
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

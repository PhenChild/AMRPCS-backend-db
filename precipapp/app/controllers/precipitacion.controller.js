const precipitaciones = require('../models').Precipitacion
const observadores = require('../models').Observador
const usuarios = require('../models').User
const user = require('../models').User
const estaciones = require('../models').Estacion
const divisiones = require('../models').Division
const { resolveContent } = require('nodemailer/lib/shared')
const Sequelize = require('../models')
const Op = require('sequelize').Op


/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
exports.newPrecipitacion = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      await precipitaciones.create({
        fecha: Date.parse(req.body.fecha),
        valor: parseFloat(req.body.valor),
        comentario: req.body.comentario,
        idObservador: parseInt(req.obsId)
      }, { transaction: t }).then(prec => {
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
getPrecipitaciones = async function (options, req, res, next) {
  try {
    await precipitaciones.findAll(options)
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

module.exports.getPrecipitaciones = getPrecipitaciones

exports.getFiltro = async function (req, res, next) {
  var datos = req.query
  var fI = datos.fechaInicio
  var fF
  if (!datos.fechaInicio) fI = new Date('December 17, 1995 03:24:00')
  if (!datos.fechaFin) fF = new Date(Date.now() + 82800000)
  else fF = new Date(Date.parse(datos.fechaFin) + 82800000)
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
  getPrecipitaciones(options, req, res, next)
}

getDatosGraficos = async function (req, res, next) {
  var datos = req.query
  var nombreEstacion = datos.estacion
  var fechaInicio = new Date(new Date(datos.fechaInicio).setHours(42, 59, 59))
  var fechaFin = new Date(new Date(datos.fechaFin).setHours(42, 59, 59))
  var dates = getDates(fechaInicio, fechaFin)

  var jsonArray = []

  var est = await estaciones.findAll({
    where: { [Op.or]: [{ nombre: {[Op.iLike]: nombreEstacion}}, { codigo: {[Op.iLike]: nombreEstacion} }], state: 'A' },
    attributes: { exclude: ['foto'] }
  })
    .then(estacion => {
      if (!estacion[0]) {
        res.status(418).send({ message: 'Not found' })
        return
      }
    })

  var datesPrec
  if (est) {
    datesPrec = await precipitaciones.findAll({
      where: { fecha: { [Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      order: [
        ['fecha', 'ASC']
      ],
      required: true,
      attributes: ['fecha', 'valor'],
      include: [{
        model: observadores, required: true, where: { state: 'A' }, attributes: [], include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombreEstacion + '%' } }, { codigo: { [Op.iLike]: '%' + nombreEstacion + '%' } }], state: 'A' }, attributes: []
        }]
      }]
    })
    if (!datesPrec[0]) {
      datesPrec[0] = fechaFin
    }
  }
  else
    datesPrec = await precipitaciones.findAll({
      where: { fecha: { [Op.between]: [fechaInicio, fechaFin] }, state: "A" },
      order: [
        ['fecha', 'ASC']
      ],
      required: true,
      attributes: ['fecha', 'valor', 'comentario', 'idObservador'],
      include: [{
        model: observadores, required: true, where: { state: 'A' }, attributes: ['idUser'], include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: ['nombre', 'apellido']
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: { [Op.iLike]: '%' + nombreEstacion + '%' } }, { codigo: { [Op.iLike]: '%' + nombreEstacion + '%' } }], state: 'A' }, attributes: []
        }]
      }]
    })
  if (!datesPrec[0]) {
    datesPrec[0] = fechaFin
  }
  var tama = dates.length
  var i = 0
  for (var prec of datesPrec) {
    while (dates[i] < new Date(prec.fecha)) {
      var j = { fecha: dates[i], valor: -1, comentario: '', Observador: '' }
      jsonArray.push(j)
      i += 1
    }
    jsonArray.push(prec)
    i += 1
  }
  for (i; i < tama; i++) {
    jsonArray.push({ fecha: dates[i], valor: -1, comentario: '', Observador: '' })
  }
  res.json(jsonArray)
}

exports.getFiltroGrafico = async function (req, res, next) {
  var datos = req.query
  if (datos.estacion && datos.fechaInicio && datos.fechaFin) getDatosGraficos(req, res, next)
  else if (datos.fechaInicio && datos.fechaFin) getDatosGraficos(datos.fechaInicio, datos.fechaFin, res, next)
  else getPrecipitacionesGrafico(req, res, next)

}

//Funciones para grafico
getPrecipitacionesGrafico = async function (req, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      required: true,
      order: [
        ['fecha', 'ASC']
      ],
      attributes: ['fecha', 'valor']
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.updateValor = async function (req, res, next) {
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
      const prec = await precipitaciones.update({
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

getPrecipitacionesEstacionGrafico = async function (nombreEstacion, res, next) {
  try {
    await precipitaciones.findAll({
      where: { state: "A" },
      required: true,
      order: [
        ['fecha', 'ASC']
      ],
      attributes: ['fecha', 'valor'],
      include: [{
        model: observadores, required: true, where: { state: 'A' }, attributes: [], include: [{
          model: usuarios, required: true, where: { state: 'A' }, attributes: []
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: nombreEstacion }, { codigo: nombreEstacion }], state: 'A' }, attributes: []
        }]
      }]
    })
      .then(precipitaciones => {
        if (!precipitaciones[0]) {
          res.status(418).send({ message: 'No existen datos' })
        }
        else res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesFechaGrafico = async function (fechaInicio, fechaFin, res, next) {
  try {
    var fI = fechaInicio
    var fF = fechaFin
    if (!fechaInicio) fI = new Date('December 17, 1995 03:24:00')
    else if (!fechaFin) fF = Date.now()
    await precipitaciones.findAll({
      where: { fecha: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
      order: [
        ['fecha', 'ASC']
      ],
      attributes: ['fecha', 'valor'],
      required: true
    })
      .then(precipitaciones => {
        res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

getPrecipitacionesEstacionFechaGrafico = async function (nombreEstacion, fechaInicio, fechaFin, res, next) {
  try {
    var fI = fechaInicio
    var fF = fechaFin
    if (!fechaInicio) fI = new Date('December 17, 1995 03:24:00')
    else if (!fechaFin) fF = Date.now()
    await precipitaciones.findAll({
      where: { fecha: { [Op.between]: [fI, new Date(Date.parse(fF) + 82800000)] }, state: "A" },
      order: [
        ['fecha', 'ASC']
      ],
      required: true,
      attributes: ['fecha', 'valor'],
      include: [{
        model: observadores, required: true, where: { state: 'A' }, attributes: [], include: [{
          model: usuarios, required: true, where: { state: 'A' }
        }, {
          model: estaciones, required: true, where: { [Op.or]: [{ nombre: nombreEstacion }, { codigo: nombreEstacion }], state: 'A' }, attributes: []
        }]
      }]
    })
      .then(precipitaciones => {
        if (!precipitaciones[0]) {
          res.status(418).send({ message: 'No existen datos' })
        }
        else res.json(precipitaciones)
      })
      .catch(err => res.json(err.message))
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.disablePrecipitaciones = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const p = await precipitaciones.update({
        state: "I",
        audDeletedAt: Date.now()
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return p
    })
    res.status(200).send({ message: 'Succesfully disable' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

exports.activatePrecipitaciones = async function (req, res, next) {
  try {
    await Sequelize.sequelize.transaction(async (t) => {
      const p = await precipitaciones.update({
        state: "A"
      }, {
        where: { id: parseInt(req.body.id, 10) }
      }, { transaction: t })
      return p
    })
    res.status(200).send({ message: 'Succesfully actvate' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf())
  dat.setDate(dat.getDate() + days);
  return dat;
}

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate)
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}
const db = require('../models')
const config = require('../../config/auth.config')
const User = db.User
const Pais = db.Pais
const Observador = db.Observador
const Estacion = db.Estacion

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { restart } = require('nodemon')

/*---------------------------------------------------
                    APP ENDPOINTS
---------------------------------------------------*/
exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
      state: 'A'
    },
    include: [{
      model: Pais, required: false, attributes: ['nombre'], as: "Pais"
    }]
  }).then(user => {
    if (!user) {
      return res.status(404).send({ message: 'User Not found.' })
    }
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    )
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!'
      })
    }
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: '365d' // 365 dias
    })
    const userRole = user.role.toUpperCase()
    console.log(user.Pais)
    var json
    if (user.foto) {
      json = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        role: user.role,
        pais: user.Pais.nombre,
        foto: user.foto.toString('base64'),
        token: token
      }
    }
    else {
      json = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        role: user.role,
        pais: user.Pais.nombre,
        token: token
      }
    }

    if (userRole == 'OBSERVER') {
      getHasPluvObs(user.id).then(pl => {
        json["tiene_pluv"] = pl
        res.status(200).send(json)
      })
    }
    else if (userRole == 'ADMIN') {
      res.status(200).send(json)
    }
  })
    .catch(err => {
      res.status(500).send({ message: err.message })
    })
}

async function getHasPluvObs(idUser) {
  try {
    const result = await Observador.findOne({
      where: { idUser: idUser },
      attributes: [],
      include: [{
        model: Estacion, required: true, attributes: ['hasPluviometro'], as: "Estacion"
      }]
    })
    return result.Estacion.hasPluviometro;
  } catch (error) {
    console.log(error);
  }
}

/*----------------------------------------------------
----------------------------------------------------*/

exports.signup = async (req, res) => {
  // Save User to Database
  var a
  if (!req.file) a = null
  else a = Buffer.from(req.file.buffer)

  var u = await User.findOne({
    where: { email: req.body.email },
    attributes: ['id']
  })

  if (u) {
    res.status(418).send({ message: "User already exists" })
    return
  }
  else {
    await User.create({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      telefono: req.body.telefono,
      idPais: parseInt(req.body.idPais),
      state: 'A',
      foto: a,
      role: req.body.role
    })
      .then(user => {
        if (user.role == 'observer') {
          for (var est of req.body.estaciones) {
            var obs = Observador.create({
              state: 'A',
              idEstacion: parseInt(est.id),
              idUser: user.id
            })
            res.status(200).send({ message: "User created" })
            return
          }
        } else {
          // user role by default
          res.send({ message: 'User was registered without role successfully!' })
          return
        }
      })
      .catch(err => {
        res.status(500).send({ message: err.message })
      })
  }
}
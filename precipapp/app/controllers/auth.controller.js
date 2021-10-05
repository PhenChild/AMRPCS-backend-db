const db = require('../models')
const config = require('../../config/auth.config')
const User = db.User

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    idPais: parseInt(req.body.idPais),
    state: req.body.state,
    role: req.body.role
  })
    .then(user => {
      if (req.body.role) {
        user.update({ role: req.body.role }).then(() => {
          res.send({ message: 'User was registered successfully!' })
        })
      } else {
        // user role by default
        res.send({ message: 'User was registered without role successfully!' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message })
    })
}

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
      enable: true
    }
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
      expiresIn: '1800s' // 30 minutos
    })

    const userRole = 'ROLE_' + user.role.toUpperCase()
    res.status(200).send({
      id: user.id,
      email: user.email,
      role: userRole,
      accessToken: token
    })
  })
    .catch(err => {
      res.status(500).send({ message: err.message })
    })
}
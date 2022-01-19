const db = require('../models')
const ROLES = require('../constants/ENUM').ROLES
const User = db.User

// eslint-disable-next-line no-undef
checkDuplicateEmail = (req, res, next) => {
  try {
    // Username
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        res.status(418).send({
          message: 'Failed! Email is already in use!'
        })
        return
      }
      next()
    }).catch(err => {
      res.status(400).send({ message: err.message })
    })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

// eslint-disable-next-line no-undef
checkRoleExisted = (req, res, next) => {
  if (req.body.role) {
    if (!ROLES.includes(req.body.role)) {
      res.status(400).send({
        message: 'Failed! Role does not exist = ' + req.body.role
      })
      return
    }
  }
  next()
}

const verifySignUp = {
  // eslint-disable-next-line no-undef
  checkDuplicateEmail: checkDuplicateEmail,
  // eslint-disable-next-line no-undef
  checkRoleExisted: checkRoleExisted
}

module.exports = verifySignUp

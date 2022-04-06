const createError = require('http-errors')
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const usersRouter = require('./app/routes/users')
const authRouter = require('./app/routes/auth')
const obsRouter = require('./app/routes/observador')
const divisionRouter = require('./app/routes/division')
const estacionRouter = require('./app/routes/estacion')
const paisRouter = require('./app/routes/pais')
const acumRouter = require('./app/routes/prec_acum')
const precipitacionRouter = require('./app/routes/precipitacion')
const cuestionarioRouter = require('./app/routes/cuestionario')
const fotoRouter = require('./app/routes/foto')
ocupacionRouter = require('./app/routes/ocupacion')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//create a cors middleware
app.use(function(req, res, next) {
  //set headers to allow cross origin request.
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
  });

app.use('/api', usersRouter)
app.use('/api/users', authRouter)
app.use('/api/observers', obsRouter)
app.use('/api/division', divisionRouter)
app.use('/api/estacion', estacionRouter)
app.use('/api/pais', paisRouter)
app.use('/api/acumulado', acumRouter)
app.use('/api/precipitacion', precipitacionRouter)
app.use('/api/cuestionario', cuestionarioRouter)
app.use('/api/foto', fotoRouter)
app.use('/api/ocupacion', ocupacionRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

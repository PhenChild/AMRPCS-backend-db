#!/usr/bin/env node
/**
 * Module dependencies.
 */
/* Archivo Principal */
var expressApp = require('./config/express');
var app = expressApp();
var debug = require('debug')('precipapp:server');
var http = require('http');
let models = require('./app/models')

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3002');
app.set('port', port);
/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces. force only for development-env { force: true }
 */
 return models.sequelize.sync({ force: false }).then(result => {
  server.listen(port,'0.0.0.0');
  server.on('error', onError);
  server.on('listening', onListening);
})

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/// ////////////////////////////////////////////////////
//
// File: server.js
// This is the Service File - executable using node command
//
/// //////////////////////////////////////////////////

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const morgan = require('morgan');
const debug = require('debug')('vcloudx-server-api:server');

const app = express();
const bodyParser = require('body-parser');
const vcxroom = require('./vcxroom');
const vcxconfig = require('./vcxconfig');

// Initialization of basic HTTP / HTTPS Service

let server;

if (vcxconfig.SERVICE.listen_ssl === true) {
  const options = {
    key: fs.readFileSync(vcxconfig.Certificate.ssl_key).toString(),
    cert: fs.readFileSync(vcxconfig.Certificate.ssl_cert).toString(),
  };
  if (vcxconfig.Certificate.sslCaCerts) {
    options.ca = [];
    vcxconfig.Certificate.sslCaCerts.forEach((sslCaCert) => {
      options.ca.push(fs.readFileSync(sslCaCert).toString());
    });
  }
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const port = normalizePort(vcxconfig.SERVICE.port);

// Start the Service

app.set('port', port);
server.listen(port);

console.log(`Server started. Listening on Port ${port}`);
server.on('error', onError);
server.on('listening', onListening);

// Utility Function: Sanitizing Configured Port No.

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

// Exception Handler Function

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Function: To confirm Service is listening on the configured Port

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true,
}));

app.use(morgan('dev'));
app.use(express.static(vcxconfig.clientPath));

// Application Server Route Definitions - These functions communicate with EnableX Server API
// Route: To get information of a given room.

app.get('/getRoom/:roomName', (req, res) => {
  const room = req.params.roomName;
  vcxroom.getRoom(room, (status, data) => {
    res.status(200);
    res.send(data);
  });
});

// Route: To get Token for a Room

app.post('/createToken/', (req, res) => {
  vcxroom.getToken(req.body, (status, data) => {
    res.status(200);
    res.send(data);
  });
});

app.post('/createRoom/', (req, res) => {
  vcxroom.createRoom((status, data) => {
    res.send(data);
    res.status(200);
  });
});

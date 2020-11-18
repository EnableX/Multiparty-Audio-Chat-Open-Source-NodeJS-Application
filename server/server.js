/// ////////////////////////////////////////////////////
//
// File: server.js
// This is the Service File - executable using node command
//
/// //////////////////////////////////////////////////

const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const log = require('../util/logger/logger').logger;

const logger = log.getLogger('AppApi');
const vcxroom = require('./vcxroom');

// Initialization of basic HTTP / HTTPS Service
const options = {
  key: fs.readFileSync(process.env.CERTIFICATE_SSL_KEY).toString(),
  cert: fs.readFileSync(process.env.CERTIFICATE_SSL_CERT).toString(),
};
if (process.env.CERTIFICATE_SSLCACERTS) {
  options.ca = [];
  process.env.CERTIFICATE_SSLCACERTS.forEach((sslCaCert) => {
    options.ca.push(fs.readFileSync(sslCaCert).toString());
  });
}
const server = https.createServer(options, app);
const port = process.env.SERVICE_PORT || 5000;

// Start the Service
app.set('port', port);
server.listen(port);

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
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
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
  console.log(`Listening on ${bind}`);
}

logger.info(`Server started. Listening on Port ${port}`);
server.on('error', onError);
server.on('listening', onListening);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true,
}));

app.use(express.static('../client'));

// Application Server Route Definitions - These functions communicate with EnableX Server API
// Route: To get liist of all Rooms in your Application
app.get('/api/get-all-rooms', (req, res) => {
  vcxroom.getAllRooms((data) => {
    res.status(200);
    res.send(data);
  });
});

// Application Server Route Definitions - These functions communicate with EnableX Server API
// Route: To get information of a given room.
app.get('/api/get-room/:roomName', (req, res) => {
  const { roomName } = req.params;
  vcxroom.getRoom(roomName, (status, data) => {
    res.status(200);
    res.send(data);
  });
});

// Route: To get Token for a Room
app.post('/api/create-token/', (req, res) => {
  vcxroom.getToken(req.body, (status, data) => {
    res.status(200);
    res.send(data);
  });
});

// Route: To create a Room (1to1)
app.post('/api/create-room/', (req, res) => {
  vcxroom.createRoom((status, data) => {
    res.send(data);
    res.status(200);
  });
});

// Route: To create a Room (multiparty)
app.post('/api/room/multi/', (req, res) => {
  vcxroom.createRoomMulti((status, data) => {
    res.send(data);
    res.status(200);
  });
});

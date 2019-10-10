///////////////////////////////////////////////////////
//
// File: server.js
// This is the Service File - executable using node command
//
// Created: 18-02-2018
// Last Updated: 29-11-2018
// Reformat, Indentition, Inline Comments
//
/////////////////////////////////////////////////////

var express = require('express')
var https = require('https')
var http = require('http')
var fs = require('fs')
var morgan = require('morgan')
var debug = require('debug')('vcloudx-server-api:server');
var app = express()
var vcxroom = require('./vcxroom')
var auth = require('http-auth');
var basicAuth = require('basic-auth');
var vcxutil = require('./vcxutil');
var vcxconfig = require('./vcxconfig')
var bodyParser = require('body-parser')
var basic = auth.basic({
    realm: "Private Area.",
    file: vcxconfig.pwdFilePath
});

// Initialization of basic HTTP / HTTPS Service

var server;

if (vcxconfig.SERViCE.listen_ssl === true) {
    var options = {
        key: fs.readFileSync(vcxconfig.Certificate.ssl_key).toString(),
        cert: fs.readFileSync(vcxconfig.Certificate.ssl_cert).toString(),
    }
    if (vcxconfig.Certificate.sslCaCerts) {
        options.ca = [];
        for (var ca in vcxconfig.Certificate.sslCaCerts) {
            options.ca.push(fs.readFileSync(vcxconfig.Certificate.sslCaCerts[ca]).toString());
        }
    }
    server = https.createServer(options, app);
} else {
    server = http.createServer(app);
}

var port = normalizePort(vcxconfig.SERViCE.port);


// Start the Service

app.set('port', port);
server.listen(port);


console.log("Server started. Listening on Port " + port);
server.on('error', onError);
server.on('listening', onListening);


// Utility Function: Sanitizing Configured Port No.

function normalizePort(val) {
    var port = parseInt(val, 10);
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

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
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


// Function: To confirm Service is listening on the configured Port

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


app.use(morgan('dev'));
app.use(express.static(vcxconfig.clientPath));


// Application Server Route Definitions - These functions communicate with EnableX Server API
// Route: To get liist of all Rooms in your Application

app.get('/getAllRooms', function (req, res) {

    vcxroom.getAllRooms(function (data) {
        res.status(200);
        res.send(data);
    });
});


// Route: To get information of a given room.

app.get('/getRoom/:roomName', function (req, res) {
    var room = req.params.roomName;
    vcxroom.getRoom(room, function (status,data) {
        res.status(200);
        res.send(data);
    });
});


// Route: To get Token for a Room

app.post('/createToken/', function (req, res) {
    vcxroom.getToken(req.body, function (status,data) {
        res.status(200);
        res.send(data);
    });
});


app.post('/createRoom/', function (req, res) {
    vcxroom.createRoom(function (status, data) {
        res.send(data);
        res.status(200);
    });

});




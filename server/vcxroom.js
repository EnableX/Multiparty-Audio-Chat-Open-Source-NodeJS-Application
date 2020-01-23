///////////////////////////////////////////////////////
//
// File: vcxroom.js
// This file does RestAPI Call to communicate with EnableX Server API
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/////////////////////////////////////////////////////

var http = require('http')
var fs = require('fs')
var vcxconfig = require('./vcxconfig')
var vcxutil = require('./vcxutil')

var log = require('../util/logger/logger').logger;
var logger = log.getLogger('AppApi');
var vcxroom = {};

var obj = {
    "name": "demo Room",
    "owner_ref": "xdada",
    "settings": {
        "description": "",
        "scheduled": false,
        "scheduled_time": "",
        "participants": "19",
        "duration": "60",
        "auto_recording": false,
        "active_talker": true,
        "wait_moderator": false,
        "quality": "SD",
        "adhoc": false,
        "mode": "group"
    },
    "sip": {
        "enabled": false
    }
};

// HTTP Request Header Creation
var port = vcxconfig.SERVER_API_SERVER.port;
var options = {
    host: vcxconfig.SERVER_API_SERVER.host,
    key: fs.readFileSync(vcxconfig.Certificate.ssl_key).toString(),
    cert: fs.readFileSync(vcxconfig.Certificate.ssl_cert).toString(),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + vcxutil.getBasicAuthToken()
    }
}

if (port.trim() != "" && port !== undefined) {
    options.port = port;
}

// Function: To get Token for a Room

vcxroom.getToken = function (details, callback) {
    var rooms = {};
    options.path = '/v1/rooms/' + details.roomId + '/tokens';
    options.method = 'POST';
    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + vcxutil.getBasicAuthToken()
    };

    vcxutil.connectServer(options, JSON.stringify(details), function (status,data) {
        if (status === 'success')
            callback(status, data);
        else if (status === 'error')
            callback(status, data);
    });

}


// Function: To get a list of Rooms

vcxroom.getAllRooms = function (callback) {
    var rooms = {};
    options.path = '/v1/rooms/';
    options.method = 'GET';
    vcxutil.connectServer(options, null, function (status,data) {
        callback(data);
    });
}


// Function: To get information of a Room

vcxroom.getRoom = function (roomName, callback) {
    var rooms = {};
    options.path = '/v1/rooms/' + roomName;
    options.method = 'GET';
    vcxutil.connectServer(options, null, function (status,data) {
        if (status === 'success')
            callback(status, data);
        else if (status === 'error')
            callback(status, data);

    });

}

vcxroom.createRoom = function (callback) {
    var roomMeta = obj;
    options.path = '/v1/rooms/';
    options.method = 'POST';
    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + vcxutil.getBasicAuthToken()
    };
    vcxutil.connectServer(options, JSON.stringify(roomMeta), function (status, data) {
        if (status === 'success')
            callback(status, data);
        else if (status === 'error')
            callback(status, data);
    });
};


var module = module || {};
module.exports = vcxroom;
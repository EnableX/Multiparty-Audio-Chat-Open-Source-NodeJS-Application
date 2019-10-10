///////////////////////////////////////////////////////
//
// File: vcxutil.js
// This file contans utility functions to initiate RestAPI Calls
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/////////////////////////////////////////////////////


var btoa = require('btoa');
var http = require('http');
var https = require('https');
var vcxconfig = require('./vcxconfig');
var log = require('../util/logger/logger').logger;
var logger = log.getLogger('AppApi');
var vcxutil = {};



// Function: To create basic authentication header using APP ID and APP KEY

vcxutil.getBasicAuthToken = function () {
    var APP_ID = vcxconfig.APP_ID;
    var APP_KEY = vcxconfig.APP_KEY;
    var authorizationBasic = btoa(APP_ID + ':' + APP_KEY);
    return authorizationBasic;
}



// Function: To connect to Enablex Server API Service

vcxutil.connectServer = function (options, data, callback) {
    logger.info("REQ URI:- " + options.method + " " + options.host + ":" + options.port + options.path);
    logger.info("REQ PARAM:- " + data);
    var request = https.request(options, function (res) {
        res.on('data', function (chunk) {
            logger.info("RESPONSE DATA:- " + chunk);
            if(chunk.result === 0){
                callback('success',JSON.parse(chunk));
            }
            else {
                callback('error', JSON.parse(chunk));
            }
        });
    });
    request.on('error', function (err) {
        logger.info("RESPONSE ERROR:- " + JSON.stringify(err));

    });
    if (data == null)
        request.end();
    else
        request.end(data);
}
vcxutil.validAuthInvite = function(data,basic){
    var file = basic.options.users;
    var ret = false;
    if(data && data.name && data.pass){
        for(var i=0;i<file.length;i++){
            if(data.name === file[i].username && basic.validate(file[i].hash,data.pass)){
                ret = true;
            }
        }
    }
    return ret;
}

var module = module || {};
module.exports = vcxutil;
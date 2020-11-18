const log4js = require('log4js');
const logFile = require('./log4js_configuration.json');

log4js.configure(logFile);

exports.logger = log4js;

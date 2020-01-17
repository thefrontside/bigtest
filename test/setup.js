require('module-alias/register');
require('ts-node/register');
process = require('process');

let { setLogLevel } = require('../src/log-level')

setLogLevel(process.env.LOG_LEVEL || 'warn');

require('ts-node/register');
process = require('process');

let { setLogLevel } = require('@bigtest/logging')

setLogLevel(process.env.LOG_LEVEL || 'warn');

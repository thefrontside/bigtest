#!/usr/bin/env node

const { daemon, main } = require('@effection/node');
const { spawn } = require('effection');
const { subscribe } = require('@effection/subscription');

const { install } = require('./install');
const { yarn } = require('./constants');

function* start() {
  let command = yarn ? 'yarn' : 'npx';

  let port;
  let args = ['parcel', './src/index.html'];

  if(process.argv.includes('-p')){
    port = process.argv.indexOf('-p');
    args.push(...process.argv.slice(port, port + 2))
  };

  let { stdout } = yield daemon(`${command} ${args.join(' ')}`);

  yield spawn(subscribe(stdout).forEach((data) => {
    process.stdout.write(data);
    return Promise.resolve();
  }));

  yield;
};

function* run() {
  yield install({ stdio: 'inherit' });
  yield start();
};

main(run);

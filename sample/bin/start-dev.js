#!/usr/bin/env node

const { daemon, main } = require('@effection/node');
const { spawn } = require('effection');
const { subscribe } = require('@effection/subscription');
const fs = require('fs');
const fsp = fs.promises;
const rmrf = require('rmfr');

const { install } = require('./install');
const { yarn } = require('./constants');

function* dev() {
  let command = yarn ? 'yarn' : 'npx';

  let port;
  let args = ['--cwd app start'];

  if(process.argv.includes('-p')){
    port = process.argv.indexOf('-p');
    args.push(...process.argv.slice(port, port + 2))
  };

  yield fsp.copyFile('app/app-pkg.json', 'app/package.json');
  yield install({ cwd: 'app/', stdio: 'inherit' });

  let { stdout, stderr } = yield daemon(`${command} ${args.join(' ')}`);

  yield spawn(subscribe(stdout).forEach((data) => {
    process.stdout.write(data);
    return Promise.resolve();
  }));
  
  yield spawn(subscribe(stderr).forEach((data) => {
    process.stderr.write(data);
    return Promise.resolve();
  }));

  yield;
};

main(dev);

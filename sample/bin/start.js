#!/usr/bin/env node

const { main, MainError } = require('@effection/node');
const { once } = require('@effection/events');

const { yarn, formatErr } = require('./constants');
const spawn = require('cross-spawn');

function* install() {  
  let command = yarn ? 'yarn' : 'npm';
  const install = spawn(command, ['install'], {
    stdio: 'inherit'
  });
  let [code] = yield once(install, 'close');  
  if (code !== 0) {
    throw new MainError({ 
      message: `${formatErr('Error while installing')}`
    });
  };
};

async function start() {
  try {
    let port;
    if(process.argv.includes('-p')){
      port = process.argv.indexOf('-p');
    };
    let args = ['./node_modules/parcel/bin/cli', './src/index.html'];
    if(port){
      args.push(...process.argv.slice(port, port + 2))
    };
    spawn.sync('node', args, {
      stdio: 'inherit'
    });
  } catch(e) {
    throw new MainError({ message: `${formatErr(e)}`});
  }
};

function* run() {
  yield install();
  yield start();
};

main(run);

#!/usr/bin/env node

const chalk = require('chalk');
const { yarn } = require('./constants');
const spawn = require('cross-spawn');

function install() {
  return new Promise((resolve, reject) => {
    let command = yarn;
    const install = spawn(command, ['install'], {
      stdio: 'inherit'
    });
    install.on('close', code => {
      if (code !== 0) {
        reject('Error while installing');
      }
      resolve();
    });
  });
};

function start() {
  return new Promise(async (resolve) => {
    let port;
    if(process.argv.includes('-p')){
      port = process.argv.indexOf('-p');
    };
    let args = ['./node_modules/parcel/bin/cli', './src/index.html'];
    if(port){
      args.push(...process.argv.slice(port, port + 2))
    };
    await spawn.sync('node', args, {
      stdio: 'inherit'
    });
    resolve();
  })
};

function abort(e) {
  console.log(chalk`\n{red Error}: {yellow ${e}}\n`);
  process.exit(1);
};

async function run() {
  await install().catch(e => abort(e));
  await start();
};

run();

#!/usr/bin/env node

// const chalk = require('chalk');
const spawn = require('cross-spawn');
const fs = require('fs');
const rmrf = require('rimraf');

const TARGET_DIR = 'bigtest-sample';
const SOURCE_DIR = `${TARGET_DIR}/node_modules/${TARGET_DIR}`;

let yarn = false;

function setYarn() {
  console.log('setyarn');
  return new Promise((resolve, _) => {
    if (
      process.argv[2] === '--yarn' ||
      process.argv[2] === '-Y'
    ) {
      yarn = true;
      console.log('yarn set to true');
    } else {
      console.log('yarn kept as false');
    }
    resolve();
  })
};

function populate() {
  console.log('populate');
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(TARGET_DIR)) {
      reject('bigtest-sample directory already exists');
    } else {
      fs.mkdirSync(TARGET_DIR);
      const installer = {
        name: 'bigtest-sample',
        version: '0.0.0',
        private: true,
        dependencies: {
          '@minkimcello/georgia': '*'
        }
      };
      fs.writeFileSync(
        `${TARGET_DIR}/package.json`,
        JSON.stringify(installer, null, 2)
      );
      resolve();
    };
  });
};

function migrate() {
  console.log('migrate');
  return new Promise((resolve, _) => {
    const lockfile = yarn ? 'yarn.lock' : 'package-lock.json';
    rmrf.sync(`${TARGET_DIR}/${lockfile}`);
    rmrf.sync(`${TARGET_DIR}/package.json`);

    const hard_list = ['cypress/', 'public/', 'src/', 'bigtest.json', 'cypress.json', 'package.json'];
    hard_list.forEach(file => {
      if(file==='package.json'){
        fs.renameSync(`${SOURCE_DIR}/bin/${file}`, `${TARGET_DIR}/${file}`)
      } else {
        fs.renameSync(`${SOURCE_DIR}/${file}`, `${TARGET_DIR}/${file}`);
      }
    });

    rmrf.sync(`${TARGET_DIR}/node_modules/`);
    resolve();
  })
}

function install() {
  return new Promise((resolve, reject) => {
    let command = yarn ? 'yarn' : 'npm';
    const install = spawn(command, ['install'], {
      cwd: TARGET_DIR,
      stdio: 'inherit'
    });
    install.on('close', code => {
      if (code !== 0) {
        reject('did not install successfully');
        return;
      }
      resolve();
    });
  });
};

function cleanup(e) {
  console.log('Aborting because', e);
  rmrf.sync(TARGET_DIR);
  console.log('Deleted generated files.');
  process.exit(1);
};

async function run() { 
  await setYarn().catch(e => cleanup(e));
  await populate().catch(e => cleanup(e));
  await install().catch(e => cleanup(e));
  await migrate().catch(e => cleanup(e));
  await install().catch(e => cleanup(e));
};

run();

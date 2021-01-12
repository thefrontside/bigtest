#!/usr/bin/env node

const fs = require('fs');
const rmrf = require('rmfr');
const rmrfsync = require('rimraf').sync;
const { main, MainError } = require('@effection/node');

const { 
  messages, yarn, TARGET_DIR, SOURCE_DIR, startScript
} = require('./constants');
const { formatErr, formatSuccess, spin } = require('./console-helpers');
const { install } = require('./install');
const { version } = require('../package.json');

async function populate(message) {
  if (fs.existsSync(TARGET_DIR)) {
    throw new MainError({ 
      message: `${formatErr('directory \'bigtest-sample\' already exists')}\n${messages.abort}`
    });
  } else {
    fs.mkdirSync(TARGET_DIR);
    const installer = {
      name: 'bigtest-sample-temporary-package-name',
      version: '0.0.0',
      dependencies: {
        'bigtest-sample': version
      }
    };
    fs.writeFileSync(
      `${TARGET_DIR}/package.json`,
      JSON.stringify(installer, null, 2)
    );
    console.log(`\n${formatSuccess(message)}`);
  };
};

function* migrate(messages) {
  yield spin(messages.before, function*() {
    const lockfile = yarn ? 'yarn.lock' : 'package-lock.json';
    yield rmrf(`${TARGET_DIR}/${lockfile}`);
    yield rmrf(`${TARGET_DIR}/package.json`);
  
    fs.readdirSync(SOURCE_DIR).filter(file => {
      return file !== 'bin';
    }).forEach(file => {
      if(file==='package.json'){
        const {
          name, version, description, repository, author, license, 
          main, scripts, devDependencies, eslintConfig, browserslist,
          babel, jest
        } = require(`${SOURCE_DIR}/${file}`);
  
        scripts.start = startScript;
  
        const pkgjson = {
          name, version, private: true, description, repository, author, 
          license, main, scripts, devDependencies, eslintConfig, browserslist,
          babel, jest
        };
  
        fs.writeFileSync(`${TARGET_DIR}/package.json`, JSON.stringify(pkgjson, null, 2));
      } else {
        fs.renameSync(`${SOURCE_DIR}/${file}`, `${TARGET_DIR}/${file}`);
      };
    });
  
    yield rmrf(`${TARGET_DIR}/node_modules/`);
  });

  console.log(formatSuccess(messages.after));
};

function* download(messages) {
  yield spin(messages.before, install({ cwd: TARGET_DIR }));
  console.log(formatSuccess(messages.after));
};

function* run() {
  let rollback = true;
  yield populate(messages.creating_dir);
  try {
    yield download(messages.downloading_repo);
    yield migrate(messages.organizing_files);
    yield download(messages.installing_dep);
    console.log(messages.success);
    rollback = false;
  } finally {
    if(rollback){
      rmrfsync(TARGET_DIR);
      console.log(formatSuccess(messages.cleanup));
    };
  };
};

main(run);

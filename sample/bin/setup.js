#!/usr/bin/env node

const fs = require('fs');
const rmrf = require('rmfr');
const spawn = require('cross-spawn');
const { main, MainError } = require('@effection/node');
const { once } = require('@effection/events');

const { 
  messages, yarn, TARGET_DIR, SOURCE_DIR, startScript
} = require('./constants');
const { formatErr, formatSuccess, spin } = require('./helper');
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

function* install(messages) {
  yield spin(messages.before, function* (){
    let command = yarn ? 'yarn' : 'npm';
    const install = spawn(command, ['install'], {
      cwd: TARGET_DIR,
      stdio: 'ignore'
    });
    let [code] = yield once(install, 'close');
    if (code !== 0) {
      throw new MainError({ message: `${formatErr('Error while installing')}`});
    }
  });
  console.log(formatSuccess(messages.after));
};

function* clean(e, messages){
  yield spin(messages.before, function*(){
    yield rmrf(TARGET_DIR);
  });
  console.log(formatSuccess(messages.after));
  throw new MainError({ message: e.message })
};

function* run() {
  yield populate(messages.creating_dir);
  try {
    yield install(messages.downloading_repo);
    yield migrate(messages.organizing_files);
    yield install(messages.installing_dep);
    console.log(messages.success);
  } catch(e) {
    yield clean(e, messages.deleting);
  };
};

main(run);

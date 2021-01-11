#!/usr/bin/env node

const fs = require('fs');
const rmrf = require('rimraf');
const spawn = require('cross-spawn');
const { main, MainError } = require('@effection/node');
const { once } = require('@effection/events');

const { 
  messages, yarn, TARGET_DIR, SOURCE_DIR, startScript
} = require('./constants');
const { formatErr, formatSuccess, Spinner } = require('./helper');
const { version } = require('../package.json');

const animate = (msgs) => new Spinner(msgs);

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

async function migrate(messages) {
  let loading = animate(messages);
  loading.start();
  const lockfile = yarn ? 'yarn.lock' : 'package-lock.json';
  rmrf.sync(`${TARGET_DIR}/${lockfile}`);
  rmrf.sync(`${TARGET_DIR}/package.json`);

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

  rmrf.sync(`${TARGET_DIR}/node_modules/`);
  loading.stop();
  console.log(formatSuccess(messages[1]));
};

function* install(messages) {
  let loading = animate(messages);
  try {
    let command = yarn ? 'yarn' : 'npm';
    loading.start();
    const install = spawn(command, ['install'], {
      cwd: TARGET_DIR,
      stdio: 'ignore'
    });
    let [code] = yield once(install, 'close');
    if (code !== 0) {
      throw new MainError({ message: `${formatErr('Error while installing')}`});
    };
  } finally {
    loading.stop();
  };
  console.log(formatSuccess(messages[1]));
};

function clean(e){
  let message = messages.deleting;
  let loading = animate(message[0]);
  try {
    loading.start();
    rmrf.sync(TARGET_DIR);
  } finally {
    loading.stop();
  };
  console.log(formatSuccess(message[1]));
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
    clean(e);
  };
};

main(run);

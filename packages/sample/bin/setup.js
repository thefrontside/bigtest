#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const rmrf = require('rimraf');
const spawn = require('cross-spawn');

const { message, yarn, TARGET_DIR, SOURCE_DIR } = require('./constants');
const Spinner = require('./helper');

const animate = (msgs) => new Spinner(msgs);

function populate(message) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(TARGET_DIR)) {
      reject('directory \'bigtest-sample\' already exists');
    } else {
      fs.mkdirSync(TARGET_DIR);
      const installer = {
        name: 'bigtest-sample',
        version: '0.0.0',
        private: true,
        dependencies: {
          'bigtest-sample': '0.0.1-17e2eb7a'
        }
      };
      fs.writeFileSync(
        `${TARGET_DIR}/package.json`,
        JSON.stringify(installer, null, 2)
      );
      console.log(message);
      resolve();
    };
  });
};

function migrate(messages) {
  return new Promise((resolve, _) => {
    let loading = animate(messages);
    loading.start();
    const lockfile = yarn ? 'yarn.lock' : 'package-lock.json';
    rmrf.sync(`${TARGET_DIR}/${lockfile}`);
    rmrf.sync(`${TARGET_DIR}/package.json`);

    // todo: refactor hard coded list
    const hard_list = ['cypress/', 'public/', 'src/', 'bigtest.json', 'cypress.json', 'package.json']; 
    hard_list.forEach(file => {
      if(file==='package.json'){
        fs.renameSync(`${SOURCE_DIR}/bin/pkg.json`, `${TARGET_DIR}/${file}`)
      } else {
        fs.renameSync(`${SOURCE_DIR}/${file}`, `${TARGET_DIR}/${file}`);
      };
    });

    rmrf.sync(`${TARGET_DIR}/node_modules/`);
    loading.stop();
    resolve();
  })
};

function install(messages) {
  return new Promise((resolve, reject) => {
    let command = yarn ? 'yarn' : 'npm';
    let loading = animate(messages);
    loading.start();
    const install = spawn(command, ['install'], {
      cwd: TARGET_DIR,
      stdio: 'ignore'
    });
    install.on('close', code => {
      loading.stop();
      if (code !== 0) {
        reject('Error while installing');
      }
      resolve();
    });
  });
};

function abort(err, clean, messages) {
  console.log(chalk`\n{red Error}: {yellow ${err}}\n`);
  if(!clean) {
    console.log(messages);
  }
  if (clean) {
    let loading = animate(messages);
    loading.start();
    rmrf.sync(TARGET_DIR);
    loading.stop();
  }
  process.exit(1);
}

async function run() { 
  await populate(message.creating_dir)
    .catch(err => abort(err, false, message.abort));
  await install(message.downloading_repo)
    .catch(err => abort(err, true, message.deleting));
  await migrate(message.organizing_files);
  await install(message.installing_dep)
    .catch(err => abort(err, true, message.deleting));
  console.log(message.success);
};

run();

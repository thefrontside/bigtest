#!/usr/bin/env node

const { main, MainError } = require('@effection/node');
const rmrfsync = require('rimraf').sync;
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const ncp = require('ncp').ncp;

const { messages, generateInstructions } = require('./messages');
const { formatErr, formatSuccess, spin } = require('./console-helpers');
const { install } = require('./install');
const { processTemplate } = require('./template');

const SOURCE_DIR = `${path.dirname(__dirname)}/app`;
const TARGET_DIR = process.env.DEV_BUILD ? `${path.dirname(__dirname)}/build`: `${process.cwd()}/bigtest-sample`;

let template;

async function createDirectory(message) {
  if (fs.existsSync(TARGET_DIR)) {
    if(!process.env.DEV_BUILD){
      throw new MainError({
        message: `${formatErr('directory \'bigtest-sample\' already exists')}\n${messages.abort}`
      });
    } else {
      rmrfsync(`${TARGET_DIR}/*`);
    }
  } else {
    await fsp.mkdir(TARGET_DIR);
    console.log(`\n${formatSuccess(message)}`);
  }
}

function* migrate(messages) {
  yield spin(messages.before, function* () {
    const { pkgjson, files, templateName } = processTemplate();
    template = templateName;
    yield fsp.writeFile(`${TARGET_DIR}/package.json`, JSON.stringify(pkgjson, null, 2));
    yield fsp.readdir(SOURCE_DIR).then(sourceFiles => sourceFiles.forEach((file) => {
      if(files.includes(file)){
        ncp(`${SOURCE_DIR}/${file}`, `${TARGET_DIR}/${file}`);
      };
    }));
    switch(templateName){
      case 'cypress':
        rmrfsync(`${TARGET_DIR}/src/test/*bigtest*`);
        rmrfsync(`${TARGET_DIR}/src/test/*jest*`);
        break;
      case 'jest':
        rmrfsync(`${TARGET_DIR}/src/test/*bigtest*`);
        rmrfsync(`${TARGET_DIR}/src/test/*cypress*`);
        break;
      case 'bigtest':
        rmrfsync(`${TARGET_DIR}/src/test/*cypress*`);
        rmrfsync(`${TARGET_DIR}/src/test/*jest*`);
        break;
    };
  });
  console.log(formatSuccess(messages.after));
}

function* installDependencies(messages) {
  yield spin(messages.before, install({ cwd: TARGET_DIR }));
  console.log(formatSuccess(messages.after));
}

function* run() {
  let rollback = true;
  yield createDirectory(messages.creating_dir);
  try {
    yield migrate(messages.organizing_files);
    yield installDependencies(messages.installing_dep);
    let successMessage = generateInstructions(template);
    console.log(successMessage);
    rollback = false;
  } finally {
    if(rollback){
      rmrfsync(TARGET_DIR);
      console.log(formatSuccess(messages.cleanup));
    }
  }
}

main(run);

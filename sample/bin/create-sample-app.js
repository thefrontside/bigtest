#!/usr/bin/env node

const { main, MainError } = require('effection');
const rmrfsync = require('rimraf').sync;
const fsp = require('fs').promises;
const fse = require('fs-extra');
const path = require('path');

const { messages, generateInstructions } = require('./messages');
const { formatErr, formatSuccess, spin } = require('./console-helpers');
const { install } = require('./install');
const { processTemplate } = require('./template');

const SOURCE_DIR = `${path.dirname(__dirname)}/app`;
const TARGET_DIR = process.env.DEV_BUILD ? `${path.dirname(__dirname)}/build`: `${process.cwd()}/bigtest-sample`;

let template;

async function createDirectory(message) {
  if (fse.existsSync(TARGET_DIR)) {
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

function migrate(messages) {
  return function*(){
     yield spin(messages.before, function* () {

      let { pkgjson, files, templateName } = processTemplate();
      template = templateName;
      yield fsp.writeFile(`${TARGET_DIR}/package.json`, JSON.stringify(pkgjson, null, 2));

      yield fsp.readdir(SOURCE_DIR).then(sourceFiles => sourceFiles.forEach((file) => {
        if(files.includes(file)){
          fse.copySync(`${SOURCE_DIR}/${file}`, `${TARGET_DIR}/${file}`);
        }
      }));

      switch(templateName){
        case 'cypress':
          rmrfsync(`${TARGET_DIR}/src/test/bigtest.test.js`);
          rmrfsync(`${TARGET_DIR}/src/test/jest.test.js`);
          break;
        case 'jest':
          rmrfsync(`${TARGET_DIR}/src/test/bigtest.test.js`);
          rmrfsync(`${TARGET_DIR}/src/test/cypress.spec.js`);
          break;
        case 'bigtest':
          rmrfsync(`${TARGET_DIR}/src/test/cypress.spec.js`);
          rmrfsync(`${TARGET_DIR}/src/test/jest.test.js`);
          break;
      }
    });
    console.log(formatSuccess(messages.after));
  };
}

function installDependencies(messages) {
  return function*() {
    yield spin(messages.before, install({ cwd: TARGET_DIR }));
    console.log(formatSuccess(messages.after));
  };
}

main(function*() {
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
});

const { MainError } = require('@effection/node');
const merge = require('lodash.merge');
const chalk = require('chalk');

const { formatErr } = require('./console-helpers');
const { baseTemplate, bigTestTemplate, cypressTemplate, jestTemplate } = require('./templates');

function processTemplate() {
  let pkgjson;
  let files;
  let templateName;
  if(process.argv.includes('--only')){
    let onlyFlagIndex = process.argv.indexOf('--only');
    templateName = process.argv[onlyFlagIndex + 1];
    if(templateName !== 'cypress' && templateName !== 'bigtest' && templateName !== 'jest'){
      throw new MainError({ message: `${formatErr(`The --only flag received an unrecognized framework.`)}` });
    } else {
      switch(templateName){
        case 'cypress':
          pkgjson = merge(baseTemplate.pkgjson, cypressTemplate.pkgjson);
          files = [...baseTemplate.files, ...cypressTemplate.files];
          break;
        case 'jest':
          pkgjson = merge(baseTemplate.pkgjson, jestTemplate.pkgjson);
          files = [...baseTemplate.files, ...jestTemplate.files];
          break;
        case 'bigtest':
          pkgjson = merge(baseTemplate.pkgjson, bigTestTemplate.pkgjson);
          files = [...baseTemplate.files, ...bigTestTemplate.files];
          break;
      };
    }
  } else {
    pkgjson = merge(
      baseTemplate.pkgjson,
      bigTestTemplate.pkgjson,
      cypressTemplate.pkgjson,
      jestTemplate.pkgjson
    );
    files = [...baseTemplate.files, ...bigTestTemplate.files, ...jestTemplate.files, ...cypressTemplate.files];
  };
  
  return { 
    pkgjson, files, templateName
  };
}

module.exports = {
  processTemplate
};

const { MainError } = require('effection');
const merge = require('lodash.merge');
const chalk = require('chalk');

const { formatErr } = require('./console-helpers');
const { baseTemplate, bigtestTemplate, cypressTemplate, jestTemplate } = require('./templates');

function processTemplate() {
  let pkgjson;
  let files;
  let templateName;
  if(process.argv.includes('--only')){
    let onlyFlagIndex = process.argv.indexOf('--only');
    templateName = process.argv[onlyFlagIndex + 1];
    if(templateName !== 'cypress' && templateName !== 'bigtest' && templateName !== 'jest'){
      throw new MainError({ message: `${formatErr(`Expected value of ${chalk`{cyan --only}`} to be one of ${chalk`{cyan jest}`}, ${chalk`{cyan cypress}`}, or ${chalk`{cyan bigtest}`}, but received ${chalk`{red ${templateName}}`}`)}` });
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
          pkgjson = merge(baseTemplate.pkgjson, bigtestTemplate.pkgjson);
          files = [...baseTemplate.files, ...bigtestTemplate.files];
          break;
      }
    }
  } else {
    pkgjson = merge(
      baseTemplate.pkgjson,
      bigtestTemplate.pkgjson,
      cypressTemplate.pkgjson,
      jestTemplate.pkgjson
    );
    files = [...baseTemplate.files, ...bigtestTemplate.files, ...jestTemplate.files, ...cypressTemplate.files];
  }

  return {
    pkgjson, files, templateName
  };
}

module.exports = {
  processTemplate
};

const { exec } = require('@effection/node');
const { subscribe } = require('@effection/subscription');
const { spawn } = require('effection');
const { yarn } = require('./constants');

function* install({ cwd, stdio = 'ignore' }) {  
  let command = yarn ? 'yarn' : 'npm';
  let install = yield exec(`${command} install`, { cwd });
  if(stdio === 'inherit'){
    yield spawn(subscribe(install.stdout).forEach((data) => {
      process.stdout.write(data);
      return Promise.resolve();
    }));
  };
  yield install.expect();
};

module.exports = {
  install
};

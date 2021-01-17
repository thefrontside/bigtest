const { exec } = require('@effection/node');
const { subscribe } = require('@effection/subscription');
const { spawn } = require('effection');

function* install({ cwd, stdio }) {  
  let command = process.argv.includes('-Y') || process.argv.includes('-yarn') ? 'yarn' : 'npm';
  let install = yield exec(`${command} install`, { cwd });
  if(stdio === 'inherit'){
    yield spawn(subscribe(install.stdout).forEach((data) => {
      process.stdout.write(data);
      return Promise.resolve();
    }));
    yield spawn(subscribe(install.stderr).forEach((data) => {
      process.stderr.write(data);
      return Promise.resolve();
    }));
  };
  yield install.expect();
};

module.exports = {
  install
};

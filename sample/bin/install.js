const { exec } = require('@effection/process');
const { spawn } = require('effection');

function install({ cwd, stdio }) {
  return function*(){
    let command = process.argv.includes('-Y') || process.argv.includes('-yarn') ? 'yarn' : 'npm';
    let install = yield exec(`${command} install`, { cwd });
    if(stdio === 'inherit'){
      spawn(install.stdout.forEach((data) => {
        process.stdout.write(data);
      }));
      spawn(install.stderr.forEach((data) => {
        process.stderr.write(data);
      }));
    }
    yield install.expect();
  };
}

module.exports = {
  install
};

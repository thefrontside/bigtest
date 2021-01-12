const { MainError } = require('@effection/node');
const { once } = require('@effection/events');
const spawn = require('cross-spawn');
const { yarn, formatErr } = require('./constants');

function* install(cwd) {  
  let command = yarn ? 'yarn' : 'npm';
  const install = spawn(command, ['install'], {
    stdio: 'ignore',
    cwd
  });
  let [code] = yield once(install, 'close');  
  if (code !== 0) {
    throw new MainError({ 
      message: `${formatErr('Error while installing')}`
    });
  };
};

module.exports = {
  install
};
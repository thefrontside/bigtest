const chalk = require('chalk');
const { sleep } = require('effection');

function spin(message, operation){
  return function*(task){
    task.spawn(function* () {
      const spinner = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
      let frameNumber = 0;
      try {
        while(true) {
          let spinnerGlyph = chalk`{yellow ${spinner[frameNumber++ % spinner.length]}}`;
          process.stdout.write('\u001b[0G' + spinnerGlyph + ' ' + message + '\u001b[0m');
          yield sleep(30);
        };
      } finally {
        process.stdout.write('\u001b[0G\u001b[2K');
      };
    });
    return yield operation;
  };
};

const formatErr = (err) => {
  return chalk`{red Error}: {yellow ${err}}\n`
};

const formatSuccess = (message) => {
  return chalk`{blueBright ✓} ${message}`;
};

module.exports = {
  formatErr,
  formatSuccess,
  spin
};

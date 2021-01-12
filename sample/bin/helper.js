const chalk = require('chalk');
const sprintf = require('util').format;

function Spinner(messages) {
  this.start = () => {
    const spinner = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
    let i = 0;
    const play = (arr, speed) => {
      let drawTick = () => {
        let str = arr[i++ % arr.length];
        process.stdout.write('\u001b[0G' + str + '\u001b[90m' + messages[0] + '\u001b[0m');
      };
      this.timer = setInterval(drawTick, speed);
    };

    const frames = spinner => spinner.map(frame => {
      return sprintf('\u001b[96m%s ', chalk.yellow(frame));
    });
    
    play(frames(spinner), 30);
  };

  this.stop = () => {
    process.stdout.write('\u001b[0G\u001b[2K');
    clearInterval(this.timer);
  };
};

function* spin(msg, operation){
  let spinner = new Spinner(msg);
  spinner.start();
  try {
    return yield operation;
  } finally {
    spinner.stop();
  };
};

const formatErr = (err) => {
  return chalk`\n{red Error}: {yellow ${err}}\n`
};

const formatSuccess = (message) => {
  return chalk`{blueBright ✓} ${message}`;
};

module.exports = {
  formatErr,
  formatSuccess,
  Spinner,
  spin
};

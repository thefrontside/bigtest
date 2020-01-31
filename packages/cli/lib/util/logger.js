import { createLogger, format, transports } from 'winston';
import chalk from 'chalk';

const colors = {
  info: 'blue',
  warn: 'yellow',
  error: 'red'
};

const logger = createLogger({
  // instead of combining multiple, custom, formats just do them all
  // in a single custom formatter
  format: format.printf(info => {
    let { level, message } = info;
    let prefix = '';

    // when logging non-default levels, add a colored level prefix
    if (logger.level !== 'info' || level !== 'info') {
      if (colors[level]) {
        prefix += chalk[colors[level]](level) + ' ';
      } else {
        prefix += chalk.gray(level) + ' ';
      }
    }

    // make code blocks green
    if (message.indexOf('`') > -1) {
      message = message.replace(/`.*?`/g, chalk.green('$&'));
    }

    return chalk`${prefix}{white ${message}}`;
  }),

  transports: [
    new transports.Console()
  ]
});

export default logger;

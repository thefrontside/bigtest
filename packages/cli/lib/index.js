import yargonaut from 'yargonaut';
import yargs from 'yargs';
import chalk from 'chalk';

yargonaut
  .style('red.bold', [
    'Did you mean %s?'
  ])
  .style('blue', [
    'aliases:',
    'default:',
    'array',
    'boolean',
    'number',
    'string'
  ])
  .style('green.bold', [
    'Commands:',
    'Options:',
    'Serve Options:',
    'Adapter Options:',
    'Client Options:',
    'Proxy Options:'
  ]);

yargs
  .scriptName('bigtest')
  .usage(chalk`{green.bold Usage:} $0 <command>`)
  .version(require('../package.json').version)
  .command(require('./init'))
  .command(require('./run'))
  .demandCommand(1, '')
  .recommendCommands()
  .fail((msg, err, yargs) => {
    if (!msg) {
      console.log(yargs.help());
      process.exit();
    } else if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.error(msg);
      process.exit(1);
    }
  })
  .help()
  .wrap(null)
  .parse();

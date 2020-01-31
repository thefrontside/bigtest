import chalk from 'chalk';

function builder(yargs) {
  yargs
    .usage(chalk`{green.bold Usage:} $0 run [options]`)
    .option('network', {
      group: 'Options:',
      description:
        'Generate @bigtest/mirage files for mocking the applications network',
      type: 'boolean',
      default: false
    })
    .option('app-framework', {
      group: 'Options:',
      description: 'Generate the BigTest framework-specific test helper file',
      type: 'string',
      default: 'react'
    });
}

async function handler(argv) {
  await require('./init').default(argv);
}

module.exports = {
  command: 'init',
  builder,
  handler
};

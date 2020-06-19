import { Operation } from 'effection';
import yargs, { Argv } from 'yargs';
import { ProjectOptions } from '@bigtest/project';
import { setLogLevel, Levels } from '@bigtest/logging';

import { startServer } from './start-server';
import { runTest } from './run-test';

import { loadConfig } from './config';

type Command = 'server' | 'test' | 'ci';

export function * CLI(argv: string[]): Operation {
  let config: ProjectOptions = yield loadConfig();
  let command = parseOptions(config, argv);

  if (command === 'server') {
    yield startServer(config);
    yield;
  } else if (command === 'test') {
    yield runTest(config);
  } else {
    yield startServer(config);
    yield runTest(config);
  }
}

function parseOptions(config: ProjectOptions, argv: readonly string[]): Command {
  function startOptions(yargs: Argv) {
    return yargs
      .option('launch', {
        describe: 'launch specified driver at server startup',
        type: 'array',
        choices: Object.keys(config.drivers),
        default: config.launch,
      })
  };

  let rawOptions = yargs({})
    .scriptName('bigtest')
    .option('log-level', {
      default: 'info',
      global: true,
      choices: ['debug', 'info', 'warn', 'error'],
      desc: 'increase or decrease the amount of logging information printed to the console'
    })
    .command('server', 'start a bigtest server', startOptions)
    .command('test', 'run tests against server')
    .command('ci', 'start a server and run the test suite', startOptions)
    .demandCommand()
    .help()
    .parse(argv);

  setLogLevel(rawOptions['log-level'] as Levels);

  if(rawOptions['launch']) {
    config.launch = rawOptions['launch'];
  }

  return rawOptions._[0] as Command;
}

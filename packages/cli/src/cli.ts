import { Operation } from 'effection';
import yargs, { Argv } from 'yargs';
import { ProjectOptions } from '@bigtest/project';
import { setLogLevel, Levels } from '@bigtest/logging';

import { startServer } from './start-server';
import { runTest } from './run-test';
import lines from './formatters/lines';

import { loadConfig } from './config';

type Command = 'server' | 'test' | 'ci';

export function * CLI(argv: string[]): Operation {
  let config: ProjectOptions = yield loadConfig();
  let command = parseOptions(config, argv);

  if (command === 'server') {
    yield startServer(config);
    yield;
  } else if (command === 'test') {
    yield runTest(config, lines);
  } else if (command === 'ci') {
    yield startServer(config);
    yield runTest(config, lines);
  } else {
    throw new Error(`unknown command: ${command}`);
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
      .option('test-files', {
        describe: 'file globs which form the test suite',
        type: 'array'
      })
      .option('app.url', {
        describe: 'url of the target application',
        type: 'string',
      })
      .option('app.command', {
        describe: 'command to start the target application',
        type: 'string'
      })
      .option('no-app.command', {
        describe: 'tells the cli to ignore the app.command in the config',
        type: 'boolean'
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

  if(rawOptions['testFiles']) {
    config.testFiles = rawOptions['testFiles'] as string[];
  }

  if(rawOptions['app']) {
    config.app = { ...config.app, ...(rawOptions['app'] as object) };
  }

  return rawOptions._[0] as Command;
}

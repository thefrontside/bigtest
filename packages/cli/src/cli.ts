import { spawn, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import yargs from 'yargs';
import { ProjectOptions } from '@bigtest/project';
import { createServer, createOrchestratorAtom, createOrchestrator, Client } from '@bigtest/server';
import { setLogLevel, Levels } from '@bigtest/logging';

import { loadConfig } from './config';
import * as query from './query';

export function * CLI(argv: string[]): Operation {
  let config: ProjectOptions = yield loadConfig();

  let options = parseOptions(config, argv);

  setLogLevel(options.logLevel);

  if (options.command === 'server') {
    let launch = options.launch;
    if (launch.length > 0) {
      config.launch = launch;
    }

    for (let key of config.launch) {
      if (!config.drivers[key]) {
        throw new Error(`Could not find launch key ${key} in the set of drivers: ${JSON.stringify(Object.keys(config.drivers))}`);
      }
    }

    yield createServer(config);

  } else if (options.command === 'test') {
    let client: Client = yield Client.create(`ws://localhost:${config.port}`);

    let { run: testRunId } = yield client.query(query.run());

    console.log('Starting test run:', testRunId);

    let subscription = yield client.subscribe(query.testRunResults(testRunId));

    while(true) {
      let { testRun } = yield subscription.receive();
      if(testRun.status === 'ok') {
        console.log('SUCCESS');
        break;
      }
      if(testRun.status === 'failed') {
        console.log('FAILED');
        break;
      }
    }
  } else {
    let launch = options.launch as string[];
    if (launch.length > 0) {
      config.launch = launch;
    }

    for (let key of config.launch) {
      if (!config.drivers[key]) {
        throw new Error(`Could not find launch key ${key} in the set of drivers: ${JSON.stringify(Object.keys(config.drivers))}`);
      }
    }

    let delegate = new Mailbox();
    let atom = createOrchestratorAtom();
    yield spawn(createOrchestrator({ atom, delegate, project: config }));

    yield delegate.receive({ status: 'ready' });

    let client: Client = yield Client.create(`ws://localhost:${config.port}`);

    let { run: testRunId } = yield client.query(query.run());

    console.log('Starting test run:', testRunId);

    let subscription = yield client.subscribe(query.testRunResults(testRunId));

    while(true) {
      let { testRun } = yield subscription.receive();
      if(testRun.status === 'ok') {
        console.log('SUCCESS');
        break;
      }
      if(testRun.status === 'failed') {
        console.log('FAILED');
        break;
      }
    }
  }
}

function parseOptions(config: ProjectOptions, argv: readonly string[]): CLIOptions {
  let rawOptions = yargs({})
    .scriptName('bigtest')
    .command('server', 'start a bigtest server', (yargs) => {
      yargs
        .option('launch', {
          describe: 'launch specified driver at server startup',
          type: 'array',
          choices: Object.keys(config.drivers),
          default: config.launch,
        })
    })
    .command('test', 'run tests against server')
    .option('log-level', {
      default: 'info',
      global: true,
      choices: ['debug', 'info', 'warn', 'error'],
      desc: 'increase or decrease the amount of logging information printed to the console'
    })
    .command('ci', 'start a server and run the test suite', (yargs) => {
      yargs
        .option('launch', {
          describe: 'launch specified driver at server startup',
          type: 'array',
          choices: Object.keys(config.drivers),
          default: config.launch
        })
    })
    .demandCommand()
    .help()
    .parse(argv);

  return {
    command: rawOptions._[0] as CLIOptions["command"],
    logLevel: rawOptions['log-level'] as Levels,
    launch: rawOptions.launch as string[] || []
  }
}

interface CLIOptions {
  command: 'server' | 'test' | 'ci';
  launch: string[];
  logLevel: Levels;
}

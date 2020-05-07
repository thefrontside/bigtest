import { Operation } from 'effection';
import yargs from 'yargs';
import { ProjectOptions } from '@bigtest/project';
import { createServer, Client } from '@bigtest/server';
import { setLogLevel, Levels } from '@bigtest/logging';

import { loadConfig } from './config';
import * as query from './query';

import { Launches, parseLaunches } from './parse-launches';

export function CLI(argv: string[]): Operation {
  return ({ fork, resume }) => {
    yargs({})
      .scriptName('bigtest')
      .command('server', 'start a bigtest server', (yargs) => {
        yargs
          .option('launch', {
            describe: 'launch specified driver at server startup',
            default: []
          })
          .coerce('launch', parseLaunches)
      }, (options) => {
        setLogLevel(options.logLevel as Levels);

        fork(function* server() {
          let config: ProjectOptions = yield loadConfig(options.configFile as string | undefined);

          if (Object.keys(options.launch as object).length !== 0) {
            config.launch = options.launch as Launches;
          }

          yield createServer(config);
        });
      })

      .command('test', 'run tests against server', (yargs) => yargs, (options) => {
        setLogLevel(options.logLevel as Levels);

        fork(function* server() {
          let config = yield loadConfig(options.configFile as string | undefined);
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
          };
        });
      })
      .option('log-level', {
        default: 'info',
        global: true,
        choices: ['debug', 'info', 'warn', 'error'],
        desc: 'increase or decrease the amount of logging information printed to the console'
      })
      .option('config-file', {
        global: true,
        desc: 'path to the config file'
      })
      .demandCommand()
      .help()
      .parse(argv);
    resume({})
  };
}

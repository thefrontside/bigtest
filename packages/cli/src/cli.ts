import { Operation } from 'effection';
import yargs from 'yargs';
import { createServer, Client } from '@bigtest/server';
import { setLogLevel } from '@bigtest/logging';

import { loadConfig } from './config';
import * as query from './query';

export function CLI(argv: string[]): Operation {
  return ({ fork, resume }) => {
    yargs({})
      .scriptName('bigtest')
      .command('server', 'start a bigtest server', (yargs) => yargs, (options) => {
        console.log(options);
        setLogLevel(options['logLevel']);

        fork(function* server() {
          let config = yield loadConfig();
          yield createServer(config);
        });
      })
      .command('test', 'run tests against server', (yargs) => yargs, (options) => {
        setLogLevel(options['logLevel']);

        fork(function* server() {
          let config = yield loadConfig();
          let client: Client = yield Client.create(`ws://localhost:${config.port}`);

          let { testRunId } = yield client.query(query.run());

          console.log("Starting test run:", testRunId);

          yield client.subscribe(query.testRunResults(), function*(data) {
            console.log('==== new subscription result ==== ');
            console.log(JSON.stringify(data, null, 2));
          });
        });
      })
      .option('log-level', {
        default: 'info',
        global: true,
        choices: ['debug', 'info', 'warn', 'error'],
        desc: 'increase or decrease the amount of logging information printed to the console'
      })
      .demandCommand()
      .help()
      .parse(argv);
    resume({})
  };
}

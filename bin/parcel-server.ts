import { fork } from 'effection';
import { createParcelServer } from '../src/parcel-server';
import * as yargs from 'yargs';

yargs
  .command('$0 [files..]', 'run the parcel server', () => {}, (argv) => {
    fork(function*() {
      let interrupt = () => { this.halt() };
      process.on('SIGINT', interrupt);

      try {
        yield createParcelServer(argv.files as string[], {
          port: argv.port as number,
        });
      } finally {
        process.off('SIGINT', interrupt);
      }
    });
  })
  .option('port', {
    alias: 'p',
    demandOption: true,
    type: 'number',
    describe: 'the port to run on',
  })
  .help()
  .argv

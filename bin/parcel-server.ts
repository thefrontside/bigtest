import { fork } from 'effection';
import { createParcelServer } from '../src/parcel-server';
import * as yargs from 'yargs';

yargs
  .command('$0 [files..]', 'run the parcel server', () => {}, (argv) => {
    fork(function*() {
      let interrupt = () => { this.halt() };
      process.on('SIGINT', interrupt);

      try {
        yield createParcelServer(argv.files as string[], { port: argv.port as number }, {
          outFile: argv.outFile,
          global: argv.global,
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
  .option('out-file', {
    alias: 'o',
    type: 'string',
    describe: 'set the output filename for the application entry point',
  })
  .option('global', {
    type: 'string',
    describe: 'expose your module through a global variable',
  })
  .help()
  .argv

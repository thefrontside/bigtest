import { fork } from 'effection';
import { createParcelServer } from '../src/parcel-server';
import * as yargs from 'yargs';

const argv =
  yargs
    .command('$0 [files..]', 'run the parcel server', () => {}, (argv) => {
      console.log('this command will be run by default')
    })
    .option('port', {
      alias: 'p',
      demandOption: true,
      type: 'number',
      describe: 'the port to run on',
    })
    .help()
    .argv


fork(function*() {
  let interrupt = () => { this.halt() };
  process.on('SIGINT', interrupt);

  try {
    yield createParcelServer(argv.files as string[], {
      port: argv.port,
    });
  } finally {
    process.off('SIGINT', interrupt);
  }
});

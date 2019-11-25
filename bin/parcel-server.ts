import { fork } from 'effection';
import { ParcelServer } from '../src/parcel-server';
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
    let parcelServer = new ParcelServer(argv.files as string[], {
      port: argv.port,
    });

    yield parcelServer.start();

    if (process.send) {
      process.send({ type: "ready" });
    }

    process.on('message', message => {
      console.log('message from parent:', message);
    });

    yield;
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

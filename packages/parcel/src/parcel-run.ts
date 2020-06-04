import { ParcelOptions } from  'parcel-bundler';
import { main } from '@effection/node';
import { createParcelServer } from './parcel-server';
import * as yargs from 'yargs';

yargs
  .command('$0 [files..]', 'run the parcel server', x => x, (argv) => {
    let options: ParcelOptions & { port?: number } = JSON.parse(argv.options as string);

    main(createParcelServer(argv.files as string[], options));
  })
  .option('options', {
    type: 'string',
    describe: 'the parcel options serialized to JSON',
  })
  .help()
  .argv

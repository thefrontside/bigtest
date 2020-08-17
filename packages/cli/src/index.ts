import { CLI } from './cli';
import { main } from '@effection/node';

main(CLI(process.argv.slice(2)));

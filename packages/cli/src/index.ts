import { CLI } from './cli';
import { main } from '@effection/node';

main(function* boot() {
  yield CLI(process.argv.slice(2));
});

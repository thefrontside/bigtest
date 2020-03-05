import { $console } from './console';
import { CLI } from './cli';
import { main } from '@bigtest/effection';

main(function* boot() {
  yield $console.useStdio();
  yield CLI(process.argv.slice(2));
});

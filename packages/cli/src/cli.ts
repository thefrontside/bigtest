import { fork, Context, Operation } from 'effection';
import yargs from 'yargs';

import { $console } from './console'

export function* CLI(argv: string[]) {
  let self: Operation = ({ resume, context: { parent }}) => resume(parent);
  let context: Context = yield self;

  let spawn: (operation: Operation) => Context = (operation: Operation) => context['spawn'](fork(operation));

  yargs({})
    .command('server', 'start a bigtest server', () => {
      spawn(function* server() {
        yield $console.log("BIGTEST SERVER SHOULD RUN HERE");
      })

    })
    .parse(argv);
}

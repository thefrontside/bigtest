import { Operation } from 'effection';
import yargs from 'yargs';

export function CLI(argv: string[]): Operation {
  return ({ fork, resume }) => {
    yargs({})
      .command('server', 'start a bigtest server', () => {
        fork(function* server() {
          console.log("BIGTEST SERVER SHOULD RUN HERE");
        });
      })
      .parse(argv);
    resume({})
  };
}

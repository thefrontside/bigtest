import { Sequence, Operation, Execution, fork } from 'effection';
import { on } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import { schema } from './schema';

interface CommandServerOptions {
  port: number;
};

export function createCommandServer(orchestrator: Execution, options: CommandServerOptions): Operation {
  return function *commandServer(): Sequence {
    let app = createApp();
    let server = app.listen(options.port);

    fork(function*() {
      let [error]: [Error] = yield on(server, 'error');
      throw error;
    });

    try {
      yield on(server, 'listening');

      orchestrator.send({ ready: "command" });

      yield
    } finally {
      server.close();
    }
  }
}

function createApp() {
  return express()
    .use('/', graphqlHTTP({
      schema,
      rootValue: {
        echo: ({text}) => text
      },
      graphiql: true,
    }));

}

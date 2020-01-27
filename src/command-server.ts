import { Operation, Context, fork, send } from 'effection';
import { on } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import { schema } from './schema';

interface CommandServerOptions {
  port: number;
};

export function* createCommandServer(orchestrator: Context, options: CommandServerOptions): Operation {
  let app = createApp();
  let server = app.listen(options.port);

  yield fork(function*() {
    let [error]: [Error] = yield on(server, 'error');
    throw error;
  });

  try {
    yield on(server, 'listening');

    yield send({ ready: "command" }, orchestrator);

    yield
  } finally {
    server.close();
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

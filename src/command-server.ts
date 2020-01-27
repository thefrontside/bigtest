import { Operation, Context, fork, send } from 'effection';
import { on } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { lensPath } from 'ramda';

import { schema } from './schema';
import { State } from './orchestrator/state';

interface CommandServerOptions {
  port: number;
  state: State;
};

export function* createCommandServer(orchestrator: Context, options: CommandServerOptions): Operation {
  let app = createApp(options.state);
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

function createApp(state: State) {
  return express()
    .use('/', graphqlHTTP({
      schema,
      rootValue: {
        echo: ({text}) => text,
        agents: () => {
          let agents = state.view(lensPath(['agents']));
          return Object.values(agents);
        }
      },
      graphiql: true,
    }));

}

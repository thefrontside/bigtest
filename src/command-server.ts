import { Operation, Context, fork, send } from 'effection';
import { on } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { lensPath } from 'ramda';

import { schema } from './schema';
import { State } from './orchestrator/state';
import { Test, SerializableTest } from './test';

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
        },
        manifest: () => {
          let manifest = state.get().manifest;
          let serialize = (test: Test) => JSON.stringify(serializeTest(test));
          return map(({ path, test }) => ({ path, test: serialize(test) }), manifest);
        }
      },
      graphiql: true,
    }));
}

function serializeTest(test: Test): SerializableTest {
  let { description, children, steps, assertions } = test;
  return {
    description,
    steps: [...map(({ description }) => ({ description}), steps)],
    assertions: [...map(({ description }) => ({ description }), assertions)],
    children: [...map(serializeTest, children)]
  };
}

function* map<Input, Output>(fn: ((input: Input) => Output), inputs: Iterable<Input>): Iterable<Output> {
  for (let input of inputs) {
    yield fn(input);
  }
}

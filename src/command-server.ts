import { Operation, Context, fork, send, Controls } from 'effection';
import { on } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import { schema } from './schema';
import { atom, OrchestratorState } from './orchestrator/state';
import { Test, SerializableTest } from './test';

interface CommandServerOptions {
  port: number;
};

export function* createCommandServer(orchestrator: Context, options: CommandServerOptions): Operation {
  let app = yield createApp;
  let server = app.listen(options.port);

  yield fork(function* commandServerErrorListener() {
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

function createApp(controls: Controls): void {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let context = controls.context.parent as any;

  let app = express()
    .use('/', graphqlHTTP({
      schema,
      rootValue: {
        echo: ({text}) => text,
        agents: () => context.spawn(function* () {
          let state: OrchestratorState = yield atom.get();
          return Object.values(state.agents);
        }),
        manifest: () => context.spawn(function*() {
          let state: OrchestratorState = yield atom.get();
          let manifest = state.manifest;
          let serialize = (test: Test) => JSON.stringify(serializeTest(test));
          return map(({ path, test }) => ({ path, test: serialize(test) }), manifest);
        })
      },
      graphiql: true,
    }));
  controls.resume(app);
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

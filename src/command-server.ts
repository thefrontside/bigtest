import { Operation, Context, fork, send, Controls } from 'effection';
import { on } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { graphql as executeGraphql } from 'graphql';

import { listenWS } from './ws';
import { schema } from './schema';
import { Test, SerializableTest } from './test';
import { atom } from './orchestrator/atom';
import { OrchestratorState } from './orchestrator/state';

import { handleMessage } from './command-server/websocket';

interface CommandServerOptions {
  port: number;
};

export function* createCommandServer(orchestrator: Context, options: CommandServerOptions): Operation {
  let app = yield createApp();
  let server = app.listen(options.port);

  yield fork(function* commandServerErrorListener() {
    let [error]: [Error] = yield on(server, 'error');
    throw error;
  });

  try {
    yield on(server, 'listening');

    yield send({ ready: "command" }, orchestrator);

    yield listenWS(server, handleMessage);
  } finally {
    server.close();
  }
}

function createApp(): Operation {
  return ({ resume, context: { parent }}) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let context = parent as any;

    let app = express()
      .use(graphqlHTTP(() => context.spawn(function* getOptionsData() {
        let state = yield atom.get();
        return { ...graphqlOptions(state), graphiql: true};
      })));
    resume(app);
  }
}

/**
 * Run the query or mutation in `source` against the orchestrator
 * state contained in `state`
 */
export function graphql(source: string, state: OrchestratorState): Operation {
  return executeGraphql({...graphqlOptions(state), source });
}

/**
 * Get the graphql options for running a query against `state`. Needed
 * because the express graphql server calls the `graphql` function for
 * you based on the .
 */
export function graphqlOptions(state: OrchestratorState) {
  return {
    schema,
    rootValue: {
      echo: ({text}) => text,
      agents: () => Object.values(state.agents),
      manifest: () => map(({ path, test}) => ({ path, test: JSON.stringify(serializeTest(test))}), state.manifest)
    }
  }
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

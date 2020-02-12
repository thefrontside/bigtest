import { Operation, fork } from 'effection';
import { on, Mailbox } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { graphql as executeGraphql } from 'graphql';

import { listenWS } from './ws';
import { schema } from './schema';
import { Test, SerializableTest } from './test';
import { Atom } from './orchestrator/atom';
import { OrchestratorState } from './orchestrator/state';

import { handleMessage } from './command-server/websocket';

interface CommandServerOptions {
  atom: Atom;
  port: number;
};

export function* createCommandServer(mail: Mailbox, options: CommandServerOptions): Operation {
  let app = yield createApp(mail, options.atom);
  let server = app.listen(options.port);

  yield fork(function* commandServerErrorListener() {
    let [error]: [Error] = yield on(server, 'error');
    throw error;
  });

  try {
    yield on(server, 'listening');

    mail.send({ ready: "command" });

    yield listenWS(server, handleMessage(mail, options.atom));
  } finally {
    server.close();
  }
}

function createApp(mail: Mailbox, atom: Atom): Operation {
  return ({ resume, context: { parent }}) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let context = parent as any;

    let app = express()
      .use(graphqlHTTP(() => context.spawn(function* getOptionsData() {
        return { ...graphqlOptions(mail, atom.get()), graphiql: true};
      })));
    resume(app);
  }
}

/**
 * Run the query or mutation in `source` against the orchestrator
 * state contained in `state`
 */
export function graphql(source: string, mail: Mailbox, state: OrchestratorState): Operation {
  return executeGraphql({...graphqlOptions(mail, state), source });
}

let testIdCounter = 1;

/**
 * Get the graphql options for running a query against `state`. Needed
 * because the express graphql server calls the `graphql` function for
 * you based on the .
 */
export function graphqlOptions(mail: Mailbox, state: OrchestratorState) {
  return {
    schema,
    rootValue: {
      echo: ({text}) => text,
      agents: () => Object.values(state.agents),
      manifest: () => map(({ path, test}) => ({ path, test: JSON.stringify(serializeTest(test))}), state.manifest),
      run: () => {
        let id = `test-run-${testIdCounter++}`;
        mail.send({ type: "run", id });
        return id;
      }
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

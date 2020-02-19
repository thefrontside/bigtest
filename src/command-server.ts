import { Operation, fork } from 'effection';
import { on, Mailbox } from '@effection/events';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { graphql as executeGraphql } from 'graphql';

import { listenWS } from './ws';
import { schema } from './schema';
import { Atom } from './orchestrator/atom';
import { OrchestratorState } from './orchestrator/state';

import { handleMessage } from './command-server/websocket';

interface CommandServerOptions {
  delegate: Mailbox;
  atom: Atom;
  port: number;
};

export function* createCommandServer(options: CommandServerOptions): Operation {
  let app = yield createApp(options.delegate, options.atom);
  let server = app.listen(options.port);

  yield fork(function* commandServerErrorListener() {
    let [error]: [Error] = yield on(server, 'error');
    throw error;
  });

  try {
    yield on(server, 'listening');

    options.delegate.send({ status: "ready" });

    yield listenWS(server, handleMessage(options.delegate, options.atom));
  } finally {
    server.close();
  }
}

function createApp(delegate: Mailbox, atom: Atom): Operation {
  return ({ resume, context: { parent }}) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let context = parent as any;

    let app = express()
      .use(graphqlHTTP(() => context.spawn(function* getOptionsData() {
        return { ...graphqlOptions(delegate, atom.get()), graphiql: true};
      })));
    resume(app);
  }
}

/**
 * Run the query or mutation in `source` against the orchestrator
 * state contained in `state`
 */
export function graphql(source: string, delegate: Mailbox, state: OrchestratorState): Operation {
  return executeGraphql({...graphqlOptions(delegate, state), source });
}

let testIdCounter = 1;

/**
 * Get the graphql options for running a query against `state`. Needed
 * because the express graphql server calls the `graphql` function for
 * you based on the .
 */
export function graphqlOptions(delegate: Mailbox, state: OrchestratorState) {
  return {
    schema,
    rootValue: {
      echo: ({text}) => text,
      agents: () => Object.values(state.agents),
      manifest: state.manifest,
      run: () => {
        let id = `test-run-${testIdCounter++}`;
        delegate.send({ type: "run", id });
        return id;
      }
    }
  }
}

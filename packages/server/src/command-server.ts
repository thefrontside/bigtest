import { Operation, spawn } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import * as graphqlHTTP from 'express-graphql';
import { graphql as executeGraphql } from 'graphql';

import { schema } from './schema';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';

import { handleMessage } from './command-server/websocket';

export type CommandMessage = { status: "ready" } | { type: "run"; id: string };

interface CommandServerOptions {
  delegate: Mailbox<CommandMessage>;
  atom: Atom<OrchestratorState>;
  port: number;
};

export function* createCommandServer(options: CommandServerOptions): Operation {
  let app = express();

  yield spawn(({ spawn }) => {
    app.use(graphqlHTTP(async () => await spawn(function* getOptionsData() {
      return { ...graphqlOptions(options.delegate, options.atom.get()), graphiql: true};
    })));
  });

  yield spawn(app.ws('*', handleMessage(options.delegate, options.atom)));
  yield app.listen(options.port);

  options.delegate.send({ status: "ready" });

  yield;
}

/**
 * Run the query or mutation in `source` against the orchestrator
 * state contained in `state`
 */
export function graphql(source: string, delegate: Mailbox, state: OrchestratorState): Operation {
  let options = graphqlOptions(delegate, state);
  return executeGraphql({...options, contextValue: options.context, source });
}

let testRunIds = (function * () {
  for (let current = 1; ; current++) {
    yield `TestRun:${current}`;
  }
})()

/**
 * Get the graphql options for running a query against `state`. Needed
 * because the express graphql server calls the `graphql` function for
 * you based on the .
 */
export function graphqlOptions(delegate: Mailbox, state: OrchestratorState) {
  return {
    schema,
    rootValue: state,
    context: { delegate, testRunIds }
  };
}

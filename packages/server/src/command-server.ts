import { Operation, spawn } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import * as graphqlHTTP from 'express-graphql';
import { graphql as executeGraphql } from 'graphql';

import { listenWS } from './ws';
import { schema } from './schema';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';

import { handleMessage } from './command-server/websocket';

interface CommandServerOptions {
  delegate: Mailbox;
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

  let server = yield app.listen(options.port);

  options.delegate.send({ status: "ready" });

  yield listenWS(server, handleMessage(options.delegate, options.atom));
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
export function graphqlOptions(delegate: Mailbox, state: OrchestratorState): graphqlHTTP.OptionsData {
  return {
    schema,
    rootValue: {
      echo: ({text}) => text,
      agents: () => Object.values(state.agents),
      agent: ({ id }) => state.agents[id],
      manifest: state.manifest,
      testRuns: Object.values(state.testRuns),
      testRun: ({ id }) => state.testRuns[id],
      run: () => {
        let id = `test-run-${testIdCounter++}`;
        delegate.send({ type: "run", id });
        return id;
      }
    }
  }
}

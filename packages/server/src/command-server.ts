import { Operation, spawn, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { express, Socket } from '@bigtest/effection-express';
import * as graphqlHTTP from 'express-graphql';
import { graphql as executeGraphql } from 'graphql';

import { schema } from './schema';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';

import { Message, QueryMessage, MutationMessage, isQuery, isMutation } from './protocol';

export type CommandMessage = { status: "ready" } | { type: "run"; id: string };

interface CommandServerOptions {
  delegate: Mailbox<CommandMessage>;
  atom: Atom<OrchestratorState>;
  port: number;
};

export function* createCommandServer(options: CommandServerOptions): Operation {
  let app = express();

  yield spawn(app.ws('*', handleMessage(options.delegate, options.atom)));

  yield spawn(({ spawn }) => {
    app.use(graphqlHTTP(async () => await spawn(function* getOptionsData() {
      return { ...graphqlOptions(options.delegate, options.atom.get()), graphiql: true};
    })));
  });

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

export function handleMessage(delegate: Mailbox, atom: Atom<OrchestratorState>): (socket: Socket) => Operation {
  function* handleQuery(message: QueryMessage, socket: Socket): Operation {
    yield publishQueryResult(message, atom.get(), socket);

    if (message.live) {
      yield fork(subscribe(message, socket));
    }
  }

  function* handleMutation(message: MutationMessage, socket: Socket): Operation {
    let result = yield graphql(message.mutation, delegate, atom.get());
    result.responseId = message.responseId;
    yield socket.send(result);
  }

  function* publishQueryResult(message: QueryMessage, state: OrchestratorState, socket: Socket): Operation {
    let result = yield graphql(message.query, delegate, state);
    result.responseId = message.responseId;
    yield socket.send(result);
  }

  function* subscribe(message: QueryMessage, socket: Socket) {
    yield atom.each(state => publishQueryResult(message, state, socket));
  }

  return function*(socket) {
    let messages: Mailbox = yield socket.subscribe();

    while (true) {
      let message: Message = yield messages.receive();

      if (isQuery(message)) {
        yield fork(handleQuery(message, socket));
      }
      if (isMutation(message)) {
        yield fork(handleMutation(message, socket));
      }
    }
  }
}

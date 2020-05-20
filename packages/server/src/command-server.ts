import { Operation, spawn, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import * as graphqlHTTP from 'express-graphql';
import { parse as parseGraphql, graphql as executeGraphql, subscribe as executeGraphqlSubscription, ExecutionResult } from 'graphql';

import { Connection, sendData, listenWS } from './ws';
import { schema } from './schema';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';
import { Message, Response, QueryMessage, MutationMessage, SubscriptionMessage, isQuery, isMutation, isSubscription } from './protocol';

export type CommandMessage = { status: "ready" } | { type: "run"; id: string };

interface CommandServerOptions {
  delegate: Mailbox<CommandMessage>;
  atom: Atom<OrchestratorState>;
  port: number;
};

function isAsyncIterator(value: AsyncIterableIterator<unknown> | ExecutionResult<unknown>): value is AsyncIterableIterator<unknown> {
  return value && ("next" in value) && typeof(value["next"]) === 'function';
}

function sendResponse(connection: Connection, result: Response): Operation {
  return sendData(connection, JSON.stringify(result));
}

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
function graphql(source: string, delegate: Mailbox, state: OrchestratorState): Operation {
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
function graphqlOptions(delegate: Mailbox, state: OrchestratorState) {
  return {
    schema,
    rootValue: state,
    context: {
      delegate,
      testRunIds
    }
  };
}

function handleMessage(delegate: Mailbox, atom: Atom<OrchestratorState>): (connection: Connection) => Operation {
  function* handleQuery(message: QueryMessage, connection: Connection): Operation {
    yield publishQueryResult(message, atom.get(), connection);

    if (message.live) {
      yield fork(atom.each(state => publishQueryResult(message, state, connection)));
    }
  }

  function* handleMutation(message: MutationMessage, connection: Connection): Operation {
    let result = yield graphql(message.mutation, delegate, atom.get());
    result.responseId = message.responseId;
    yield sendResponse(connection, result);
  }

  function* handleSubscription(message: SubscriptionMessage, connection: Connection): Operation {
    let result = yield executeGraphqlSubscription({
      schema,
      document: parseGraphql(message.subscription),
      contextValue: {
        delegate,
        testRunIds,
      }
    });

    if(isAsyncIterator(result)) {
      try {
        while(true) {
          let next = yield result.next();

          if(next.done) {
            break;
          } else {
            next.value.responseId = message.responseId;
            yield sendResponse(connection, next.value);
          }
        }
      } finally {
        result.return && result.return();
      }
    } else {
      result.responseId = message.responseId;
      yield sendResponse(connection, result);
    }
  }

  function* publishQueryResult(message: QueryMessage, state: OrchestratorState, connection: Connection): Operation {
    let result = yield graphql(message.query, delegate, state);
    result.responseId = message.responseId;
    yield sendResponse(connection, result);
  }

  return function*(connection) {
    let messages: Mailbox = yield Mailbox.subscribe(connection, "message");

    while (true) {
      let { args } = yield messages.receive();
      let message = JSON.parse(args[0].utf8Data) as Message;

      if (isQuery(message)) {
        yield fork(handleQuery(message, connection));
      }
      if (isSubscription(message)) {
        yield fork(handleSubscription(message, connection));
      }
      if (isMutation(message)) {
        yield fork(handleMutation(message, connection));
      }
    }
  }
}

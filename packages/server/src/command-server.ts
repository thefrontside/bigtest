import { Operation, spawn, fork } from 'effection';
import { subscribe } from '@effection/subscription';
import { express, Socket } from '@bigtest/effection-express';
import  graphqlHTTP from 'express-graphql';
import { parse as parseGraphql, graphql as executeGraphql, subscribe as executeGraphqlSubscription, ExecutionResult } from 'graphql';

import { schema } from './schema';
import { GraphqlContext } from './schema/context';
import { Slice } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';
import { Runner } from './runner';
import { SpawnContext } from './spawn-context';

import { Variables, Message, Response, QueryMessage, MutationMessage, SubscriptionMessage, isQuery, isMutation, isSubscription } from '@bigtest/client';

interface CommandServerOptions {
  runner: Runner;
  atom: Slice<OrchestratorState>;
  port: number;
};

function isAsyncIterator(value: AsyncIterableIterator<unknown> | ExecutionResult<unknown>): value is AsyncIterableIterator<unknown> {
  return value && ("next" in value) && typeof(value["next"]) === 'function';
}

export function* createCommandServer(options: CommandServerOptions): Operation {
  let status = options.atom.slice('commandService', 'status');
  let app = express();

  status.set({ type: 'starting' });

  yield app.ws('*', handleSocketConnection(options));

  let spawnContext: SpawnContext = yield spawn(undefined);

  app.raw.use(graphqlHTTP(async () => await spawnContext.spawn(function* getOptionsData() {
    return { ...graphqlOptions(options, options.atom.get()), graphiql: true};
  })));

  yield app.listen(options.port);

  status.set({ type: 'started' });

  yield;
}

/**
 * Run the query or mutation in `source` against the orchestrator
 * state contained in `state`
 */
function* graphql(source: string, variables: Variables | undefined, options: CommandServerOptions, state: OrchestratorState): Operation {
  let opts = graphqlOptions(options, state);
  return yield executeGraphql({...opts, contextValue: opts.context, source, variableValues: variables });
}

/**
 * Get the graphql options for running a query against `state`. Needed
 * because the express graphql server calls the `graphql` function for
 * you based on the .
 */
function graphqlOptions(options: CommandServerOptions, state: OrchestratorState) {
  return {
    schema,
    rootValue: state,
    context: new GraphqlContext(options.runner)
  };
}

function handleSocketConnection(options: CommandServerOptions): (socket: Socket) => Operation {
  function* handleQuery(message: QueryMessage, socket: Socket): Operation {
    yield publishQueryResult(message, options.atom.get(), socket);

    if (message.live) {
      yield fork(subscribe(options.atom).forEach((state) => publishQueryResult(message, state, socket)));
    }
  }

  function* handleMutation(message: MutationMessage, socket: Socket): Operation {
    let result: Response = yield graphql(message.mutation, message.variables, options, options.atom.get());
    result.responseId = message.responseId;
    yield socket.send(result);
  }

  function* handleSubscription(message: SubscriptionMessage, socket: Socket): Operation {
    let result = yield executeGraphqlSubscription({
      schema,
      document: parseGraphql(message.subscription),
      contextValue: new GraphqlContext(options.runner),
      variableValues: message.variables
    });

    if(isAsyncIterator(result)) {
      try {
        while(true) {
          let next = yield result.next();

          if(next.done) {
            yield socket.send({ done: true, responseId: message.responseId });
            break;
          } else {
            next.value.responseId = message.responseId;
            yield socket.send(next.value);
          }
        }
      } finally {
        result.return && result.return();
      }
    } else {
      result.responseId = message.responseId;
      yield socket.send(result);
    }
  }

  function* publishQueryResult(message: QueryMessage, state: OrchestratorState, socket: Socket): Operation {
    let result: Response = yield graphql(message.query, message.variables, options, state);
    result.responseId = message.responseId;
    yield socket.send(result);
  }

  return function*(socket) {
    let subscription = yield subscribe(socket);
    while(true) {
      let item: IteratorResult<Message> = yield subscription.next();
      if(item.done) {
        break;
      } else {
        let message = item.value;
        if (isQuery(message)) {
          yield fork(handleQuery(message, socket));
        }
        if (isSubscription(message)) {
          yield fork(handleSubscription(message, socket));
        }
        if (isMutation(message)) {
          yield fork(handleMutation(message, socket));
        }
      }
    }
  }
}

import { Operation, withLabels } from 'effection';
import { express, Express, Socket } from '@bigtest/effection-express';
import actualExpress from 'express';
import { appDir } from '@bigtest/ui';
import graphqlHTTP from 'express-graphql';
import cors from 'cors';
import { parse as parseGraphql, graphql as executeGraphql, subscribe as executeGraphqlSubscription, ExecutionResult } from 'graphql';

import { schema } from './schema';
import { GraphqlContext } from './schema/context';
import { Slice } from '@effection/atom';
import { OrchestratorState, CommandServerStatus } from './orchestrator/state';
import { Runner } from './runner';
import { TaskGroup, createTaskGroup } from './task-group';

import { Variables, Message, Response, QueryMessage, MutationMessage, SubscriptionMessage, isQuery, isMutation, isSubscription } from '@bigtest/client';

interface CommandServerOptions {
  status: Slice<CommandServerStatus>;
  runner: Runner;
  atom: Slice<OrchestratorState>;
  port: number;
};

function isAsyncIterator(value: AsyncIterableIterator<unknown> | ExecutionResult<unknown>): value is AsyncIterableIterator<unknown> {
  return value && ("next" in value) && typeof(value["next"]) === 'function';
}

export const createCommandServer = (options: CommandServerOptions): Operation<void> => withLabels(function*(task) {
  let app: Express = yield express();

  options.status.set({ type: 'starting' });

  app.ws('*', handleSocketConnection(options));

  app.raw
    .use(cors())
    .disable('x-powered-by')
    .use(actualExpress.static(appDir()))
    .use(graphqlHTTP(async () => await task.run(function* getOptionsData() {
      return { ...graphqlOptions(options, options.atom.get()), graphiql: true};
    })));

  yield app.listen(options.port);

  options.status.set({ type: 'started' });

  yield;
}, { name: 'commandServer' })

/**
 * Run the query or mutation in `source` against the orchestrator
 * state contained in `state`
 */
function* graphql(source: string, variables: Variables | undefined, options: CommandServerOptions, state: OrchestratorState): Operation<void> {
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

function handleSocketConnection(options: CommandServerOptions): (socket: Socket<Message, Response>) => Operation<void> {
  function* handleQuery(message: QueryMessage, socket: Socket<Message, Response>): Operation<void> {
    if (message.live) {
      yield options.atom.forEach((state) => publishQueryResult(message, state, socket));
    } else {
      yield publishQueryResult(message, options.atom.get(), socket);
    }
  }

  function* handleMutation(message: MutationMessage, socket: Socket<Message, Response>): Operation<void> {
    let result: Response = yield graphql(message.mutation, message.variables, options, options.atom.get());
    result.responseId = message.responseId;
    yield socket.send(result);
  }

  function* handleSubscription(message: SubscriptionMessage, socket: Socket<Message, Response>): Operation<void> {
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

  function* publishQueryResult(message: QueryMessage, state: OrchestratorState, socket: Socket<Message, Response>): Operation<void> {
    let result: Response = yield graphql(message.query, message.variables, options, state);
    result.responseId = message.responseId;
    yield socket.send(result);
  }

  return (socket) => function*() {
    let handlers = yield* createTaskGroup('message handlers');

    yield socket.forEach(function*(message) {
      if (isQuery(message)) {
        yield handlers.spawn(handleQuery(message, socket));
      }
      if (isSubscription(message)) {
        yield handlers.spawn(handleSubscription(message, socket));
      }
      if (isMutation(message)) {
        yield handlers.spawn(handleMutation(message, socket));
      }
    });

    yield handlers.allSettled();
  }
}

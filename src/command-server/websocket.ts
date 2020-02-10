import { Operation, fork, receive } from 'effection';
import { watch } from '@effection/events';

import { Message, QueryMessage, MutationMessage, isQuery, isMutation } from '../protocol';

import { atom, OrchestratorState } from '../orchestrator/state';
import { Connection, sendData } from '../ws';

import { graphql } from '../command-server';

export function* handleMessage(connection: Connection): Operation {
  yield watch(connection, "message", message => JSON.parse(message.utf8Data));

  while (true) {
    let message: Message = yield receive();
    if (isQuery(message)) {
      yield fork(handleQuery(message, connection));
    }
    if (isMutation(message)) {
      yield fork(handleMutation(message, connection));
    }
  }
}

function* handleQuery(message: QueryMessage, connection: Connection): Operation {
  yield publishQueryResult(message, yield atom.get(), connection);

  if (message.live) {
    yield fork(subscribe(message, connection));
  }
}

function* publishQueryResult(message: QueryMessage, state: OrchestratorState, connection: Connection): Operation {
  let result = yield graphql(message.query, state);
  result.responseId = message.responseId;
  yield sendData(connection, JSON.stringify(result));
}

function* subscribe(message: QueryMessage, connection: Connection) {
  while (true) {
    let state: OrchestratorState = yield atom.next();

    yield publishQueryResult(message, state, connection);
  }
}

function* handleMutation(message: MutationMessage, connection: Connection): Operation {
  console.log(message, connection);
}

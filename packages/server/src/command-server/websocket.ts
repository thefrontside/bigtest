import { Operation, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';

import { Message, QueryMessage, MutationMessage, isQuery, isMutation } from '../protocol';

import { OrchestratorState } from '../orchestrator/state';
import { Connection, sendData } from '../ws';

import { graphql } from '../command-server';

export function handleMessage(delegate: Mailbox, atom: Atom<OrchestratorState>): (connection: Connection) => Operation {
  function* handleQuery(message: QueryMessage, connection: Connection): Operation {
    yield publishQueryResult(message, atom.get(), connection);

    if (message.live) {
      yield fork(subscribe(message, connection));
    }
  }

  function* handleMutation(message: MutationMessage, connection: Connection): Operation {
    let result = yield graphql(message.mutation, delegate, atom.get());
    result.responseId = message.responseId;
    yield sendData(connection, JSON.stringify(result));
  }

  function* publishQueryResult(message: QueryMessage, state: OrchestratorState, connection: Connection): Operation {
    let result = yield graphql(message.query, delegate, state);
    result.responseId = message.responseId;
    yield sendData(connection, JSON.stringify(result));
  }

  function* subscribe(message: QueryMessage, connection: Connection) {
    yield atom.each(state => publishQueryResult(message, state, connection));
  }

  return function*(connection) {
    let messages: Mailbox = yield Mailbox.subscribe(connection, "message");

    while (true) {
      let { args } = yield messages.receive();
      let message = JSON.parse(args[0].utf8Data) as Message;

      if (isQuery(message)) {
        yield fork(handleQuery(message, connection));
      }
      if (isMutation(message)) {
        yield fork(handleMutation(message, connection));
      }
    }
  }
}

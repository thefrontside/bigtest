import { Operation, fork } from 'effection';
import { Mailbox } from '@effection/events';
import { IMessage } from 'websocket';

import { Message, QueryMessage, MutationMessage, isQuery, isMutation } from '../protocol';

import { Atom } from '../orchestrator/atom';
import { OrchestratorState } from '../orchestrator/state';
import { Connection, sendData } from '../ws';

import { graphql } from '../command-server';

export function handleMessage(atom: Atom): (connection: Connection) => Operation {
  return function*(connection) {

    let messages: Mailbox =  yield Mailbox.watch(connection, "message", ({args}) => {
      let [message] = args as IMessage[];
      return JSON.parse(message.utf8Data);
    })

    while (true) {
      let message: Message = yield messages.receive();
      if (isQuery(message)) {
        yield fork(handleQuery(atom, message, connection));
      }
      if (isMutation(message)) {
        yield fork(handleMutation(message, connection));
      }
    }
  }
}

function* handleQuery(atom: Atom, message: QueryMessage, connection: Connection): Operation {
  yield publishQueryResult(message, atom.get(), connection);

  if (message.live) {
    yield fork(subscribe(atom, message, connection));
  }
}

function* publishQueryResult(message: QueryMessage, state: OrchestratorState, connection: Connection): Operation {
  let result = yield graphql(message.query, state);
  result.responseId = message.responseId;
  yield sendData(connection, JSON.stringify(result));
}

function* subscribe(atom: Atom, message: QueryMessage, connection: Connection) {
  while (true) {
    let state: OrchestratorState = yield atom.next();

    yield publishQueryResult(message, state, connection);
  }
}

function* handleMutation(message: MutationMessage, connection: Connection): Operation {
  console.log(message, connection);
}

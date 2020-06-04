import { Operation, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';
import * as WebSocket from 'ws'

import { Message, QueryMessage, MutationMessage, isQuery, isMutation } from '../protocol';

import { OrchestratorState } from '../orchestrator/state';
import { sendData } from '../ws';

import { graphql } from '../command-server';

export function handleMessage(delegate: Mailbox, atom: Atom<OrchestratorState>): (socket: WebSocket) => Operation {
  function* handleQuery(message: QueryMessage, socket: WebSocket): Operation {
    yield publishQueryResult(message, atom.get(), socket);

    if (message.live) {
      yield fork(subscribe(message, socket));
    }
  }

  function* handleMutation(message: MutationMessage, socket: WebSocket): Operation {
    let result = yield graphql(message.mutation, delegate, atom.get());
    result.responseId = message.responseId;
    yield sendData(socket, JSON.stringify(result));
  }

  function* publishQueryResult(message: QueryMessage, state: OrchestratorState, socket: WebSocket): Operation {
    let result = yield graphql(message.query, delegate, state);
    result.responseId = message.responseId;
    yield sendData(socket, JSON.stringify(result));
  }

  function* subscribe(message: QueryMessage, socket: WebSocket) {
    yield atom.each(state => publishQueryResult(message, state, socket));
  }

  return function*(socket) {
    let messages: Mailbox = yield Mailbox.subscribe(socket, "message");

    while (true) {
      let { args } = yield messages.receive();
      let message = JSON.parse(args[0].data) as Message;

      if (isQuery(message)) {
        yield fork(handleQuery(message, socket));
      }
      if (isMutation(message)) {
        yield fork(handleMutation(message, socket));
      }
    }
  }
}

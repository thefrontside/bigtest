import { Operation, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Socket } from '@bigtest/effection-express';
import { Atom } from '@bigtest/atom';

import { Message, QueryMessage, MutationMessage, isQuery, isMutation } from '../protocol';

import { OrchestratorState } from '../orchestrator/state';

import { graphql } from '../command-server';

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

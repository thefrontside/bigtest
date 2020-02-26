import { Operation, fork, timeout } from 'effection';
import { Mailbox, any } from '@effection/events';
import { IMessage } from 'websocket';
import { assoc, dissoc, lensPath } from 'ramda';

import { createSocketServer, Connection, sendData } from './ws';
import { Atom } from './orchestrator/atom';

interface ConnectionServerOptions {
  inbox: Mailbox;
  delegate: Mailbox;
  atom: Atom;
  port: number;
  proxyPort: number;
  manifestPort: number;
};

const agentsLens = lensPath(['agents']);
let counter = 1;

export function* createConnectionServer(options: ConnectionServerOptions): Operation {
  function* handleConnection(connection: Connection): Operation {
    console.debug('[connection] connected');

    let messages = yield Mailbox.watch(connection, "message", ({ args }) => {
      let [message] = args as IMessage[];
      return { message: JSON.parse(message.utf8Data) };
    })

    let { message: { data } } = yield messages.receive({ message: { type: 'connected' } });

    let identifier = `agent.${counter++}`;

    try {
      console.debug('[connection] received connection message', data);
      options.atom.over(agentsLens, assoc(identifier, assoc("identifier", identifier, data)));

      yield fork(function*() {
        while (true) {
          console.debug('[connection] waiting for message', identifier);
          let message = yield options.inbox.receive({ agentId: identifier });

          yield sendData(connection, JSON.stringify(message));
        }
      });

      yield fork(function*() {
        while (true) {
          let message = yield messages.receive();
          console.debug("[connection] got message from client", message);
        }
      });

      yield;
    } finally {
      options.atom.over(agentsLens, dissoc(identifier));
      console.debug('[connection] disconnected');
    }
  }
  yield createSocketServer(options.port, handleConnection, function*() {
    options.delegate.send({ status: "ready" });
  });
}

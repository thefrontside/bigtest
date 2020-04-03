import { Operation, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { IMessage } from 'websocket';
import { createSocketServer, Connection, sendData } from './ws';
import { Atom } from './orchestrator/atom';
import { AgentState } from './orchestrator/state';

interface ConnectionServerOptions {
  inbox: Mailbox;
  delegate: Mailbox;
  atom: Atom;
  port: number;
  proxyPort: number;
  manifestPort: number;
};

let counter = 1;

export function* createConnectionServer(options: ConnectionServerOptions): Operation {
  function* handleConnection(connection: Connection): Operation {
    console.debug('[connection] connected');

    let messages: Mailbox = yield Mailbox.subscribe(connection, "message")

    messages = yield messages.map(({ args }) => {
      let [message] = args as IMessage[];
      return JSON.parse(message.utf8Data);
    });

    let { data  } = yield messages.receive({ type: 'connected' });

    let agentId = `agent.${counter++}`;

    let agent = options.atom.slice<AgentState>(['agents', agentId]);

    try {
      console.debug('[connection] received connection message', data);

      agent.set({ ...data, agentId });

      yield fork(function*() {
        while (true) {
          console.debug('[connection] waiting for message', agentId);
          let message = yield options.inbox.receive({ agentId: agentId });

          yield sendData(connection, JSON.stringify(message));
        }
      });

      yield fork(function*() {
        while (true) {
          let message = yield messages.receive();
          options.delegate.send({ ...message, agentId });
          console.debug("[connection] got message from client", message);
        }
      });

      yield;
    } finally {
      agent.remove();
      console.debug('[connection] disconnected');
    }
  }
  yield createSocketServer(options.port, handleConnection, function*() {
    options.delegate.send({ status: "ready" });
  });
}

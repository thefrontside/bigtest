import { Operation, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { IMessage } from 'websocket';
import { createSocketServer, Connection, sendData } from './ws';
import { Atom } from '@bigtest/atom';
import { AgentState, OrchestratorState } from './orchestrator/state';

interface ConnectionServerOptions {
  inbox: Mailbox;
  delegate: Mailbox;
  atom: Atom<OrchestratorState>;
  port: number;
  proxyPort: number;
  manifestPort: number;
};

let counter = 1;

export function generateAgentId(): string {
  return `agent.${counter++}`;
}

export function* createConnectionServer(options: ConnectionServerOptions): Operation {
  function* handleConnection(connection: Connection): Operation {
    console.debug('[connection] connected');

    let messages: Mailbox = yield Mailbox.subscribe(connection, "message")

    messages = yield messages.map(({ args }) => {
      let [message] = args as IMessage[];
      if (message.utf8Data) {
        return JSON.parse(message.utf8Data)
      } else {
        return {};
      }
    });

    let { data, agentId } = yield messages.receive({ type: 'connected' });

    agentId = agentId || generateAgentId();

    let agent = options.atom.slice<AgentState>(['agents', agentId]);

    try {
      console.log(`[connection] connected ${agentId}`);

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
      console.debug(`[connection] disconnected ${agentId}`);
    }
  }
  yield createSocketServer(options.port, handleConnection, function*() {
    options.delegate.send({ status: "ready" });
  });
}

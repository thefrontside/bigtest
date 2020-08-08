import { Operation, fork } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';
import { express, Socket } from '@bigtest/effection-express';

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
  function* handleConnection(socket: Socket): Operation {
    console.debug('[connection] connected');

    let messages: Mailbox = yield socket.subscribe();

    let { data, agentId } = yield messages.receive({ type: 'connected' });

    agentId = agentId || generateAgentId();

    let agent = options.atom.slice('agents', agentId);

    try {
      console.log(`[connection] connected ${agentId}`);

      agent.set({ ...data, agentId });

      yield fork(function*() {
        while (true) {
          console.debug('[connection] waiting for message', agentId);
          let message = yield options.inbox.receive({ agentId: agentId });

          yield socket.send(message);
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

  let app = express();

  yield app.ws('*', handleConnection);
  yield app.listen(options.port);

  options.delegate.send({ status: "ready" });

  yield;
}

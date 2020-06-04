import { Operation, fork, spawn } from 'effection';
import { Mailbox } from '@bigtest/effection';
import * as WebSocket from 'ws'
import { sendData } from './ws';
import { Atom } from '@bigtest/atom';
import { AgentState, OrchestratorState } from './orchestrator/state';
import { express } from '@bigtest/effection-express';

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
  function* handleConnection(socket: WebSocket): Operation {
    console.debug('[connection] connected');

    let messages: Mailbox = yield Mailbox.subscribe(socket, "message")

    messages = yield messages.map(({ args }) => {
      let message = args[0].data;
      return JSON.parse(message);
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

          yield sendData(socket, JSON.stringify(message));
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

  yield spawn(app.ws('*', handleConnection));
  yield app.listen(options.port);

  options.delegate.send({ status: "ready" });

  yield;
}

import { Operation, fork, timeout } from 'effection';
import { Mailbox, any } from '@effection/events';
import { IMessage } from 'websocket';
import { createSocketServer, Connection, sendData } from './ws';
import { Atom } from './orchestrator/atom';
import { AgentState } from './orchestrator/state';

interface ConnectionServerOptions {
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

    let messages = yield Mailbox.watch(connection, "message", ({ args }) => {
      let [message] = args as IMessage[];
      return { message: JSON.parse(message.utf8Data) };
    })

    yield fork(function* heartbeat() {
      while (true) {
        yield timeout(10000);
        yield sendData(connection, JSON.stringify({type: "heartbeat"}));
      }
    })

    yield fork(function* sendRun() {
      let fileName = options.atom.get().manifest.fileName;
      yield sendData(connection, JSON.stringify({
        type: "open",
        url: `http://localhost:${options.proxyPort}`,
        manifest: `http://localhost:${options.manifestPort}/${fileName}`
      }));
    });

    let { message: { data } } = yield messages.receive({ message: { type: 'connected' } });

    let identifier = `agent.${counter++}`;

    let agent = options.atom.slice<AgentState>(['agents', identifier]);

    try {
      console.debug('[connection] received connection message', data);

      agent.set({ ...data, identifier });

      while (true) {
        let message = yield messages.receive({ message: any });
        console.debug("[connection] got message", message);
      }
    } finally {
      agent.remove();
      console.debug('[connection] disconnected');
    }
  }
  yield createSocketServer(options.port, handleConnection, function*() {
    options.delegate.send({ status: "ready" });
  });
}

import { Context, Operation, fork, send, receive, any, timeout } from 'effection';
import { watch } from '@effection/events';

import { createSocketServer, Connection, sendData } from './ws';
import { atom } from './orchestrator/state';

import { lensPath, assoc, dissoc } from 'ramda';

interface ConnectionServerOptions {
  port: number;
  proxyPort: number;
  testFilePort: number;
};

const agentsLens = lensPath(['agents']);
let counter = 1;

export function* createConnectionServer(orchestrator: Context, options: ConnectionServerOptions): Operation {
  function* handleConnection(connection: Connection): Operation {
    console.debug('[connection] connected');
    yield watch(connection, "message", (message) => {
      return { message: JSON.parse(message.utf8Data) };
    });

    yield fork(function* heartbeat() {
      while (true) {
        yield timeout(10000);
        yield sendData(connection, JSON.stringify({type: "heartbeat"}));
      }
    })

    yield fork(function* sendRun() {
      yield sendData(connection, JSON.stringify({
        type: "open",
        url: `http://localhost:${options.proxyPort}`,
        manifest: `http://localhost:${options.testFilePort}/manifest.js`
      }));
    });

    let { message: { data } } = yield receive({ message: { type: 'connected' } });

    let identifier = `agent.${counter++}`;

    try {
      console.debug('[connection] received connection message', data);
      yield atom.over(agentsLens, assoc(identifier, assoc("identifier", identifier, data)));

      while (true) {
        let message = yield receive({ message: any });
        console.debug("[connection] got message", message);
      }
    } finally {
      yield atom.over(agentsLens, dissoc(identifier));
      console.debug('[connection] disconnected');
    }
  }
  yield createSocketServer(options.port, handleConnection, function*() {
    yield send({ ready: "connection" }, orchestrator);
  });
}

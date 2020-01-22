import { Sequence, Execution, Operation, fork, timeout } from 'effection';
import { on } from '@effection/events';

import { createSocketServer, Connection, Message, send } from './ws';

interface ConnectionServerOptions {
  port: number;
  proxyPort: number;
  testFilePort: number;
};

export function createConnectionServer(orchestrator: Execution, options: ConnectionServerOptions): Operation {
  return function *connectionServer(): Sequence {
    function* handleConnection(connection: Connection): Sequence {
      console.log('connection established');
      fork(function* heartbeat() {
        while (true) {
          yield timeout(10000);
          yield send(connection, JSON.stringify({type: "heartbeat"}));
        }
      })

      fork(function* sendRun() {
        yield send(connection, JSON.stringify({
          type: "open",
          url: `http://localhost:${options.proxyPort}`,
          manifest: `http://localhost:${options.testFilePort}/manifest.js`
        }));
      });

      try {
        while (true) {
          let [message]: [Message] = yield on(connection, "message");
          console.log(`mesage = `, message);
        }
      } finally {
        console.log('connection closed');
      }
    }
    yield createSocketServer(options.port, handleConnection, () => {
      orchestrator.send({ ready: "connection" });
    });
  }
}

import { Sequence, fork, timeout } from 'effection';
import { on } from '@effection/events';

import { createSocketServer, Connection, Message, send } from './ws';
import { ReadyCallback } from './http';

interface ConnectionServerOptions {
  port: number;
  proxyPort: number,
  onReady: ReadyCallback;
};

export function createConnectionServer(options: ConnectionServerOptions): Sequence {
  function* handleConnection(connection: Connection): Sequence {
    console.log('connection established');
    fork(function* heartbeat() {
      while (true) {
        yield timeout(10000);
        yield send(connection, JSON.stringify({type: "heartbeat"}));
      }
    })

    fork(function* sendRun() {
      yield send(connection, JSON.stringify({type: "open", url: `http://localhost:${options.proxyPort}`}));
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
  return createSocketServer(options.port, handleConnection, options.onReady);
}

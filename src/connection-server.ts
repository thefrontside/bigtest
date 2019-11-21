import { Sequence, fork, timeout } from 'effection';
import { on } from '@effection/events';

import { createSocketServer, Connection, Message, send } from './ws';
import { Process } from './process';

interface ConnectionServerOptions {
  port: number;
  proxyPort: number,
};

export class ConnectionServer extends Process {
  constructor(public options: ConnectionServerOptions) {
    super();
  }

  *run(): Sequence {
    let { proxyPort } = this.options;
    function* handleConnection(connection: Connection): Sequence {
      console.log('connection established');
      fork(function* heartbeat() {
        while (true) {
          yield timeout(10000);
          yield send(connection, JSON.stringify({type: "heartbeat"}));
        }
      })

      fork(function* sendRun() {
        yield send(connection, JSON.stringify({type: "open", url: `http://localhost:${proxyPort}`}));
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
    yield createSocketServer(this.options.port, handleConnection, this.isReady);
  }
}

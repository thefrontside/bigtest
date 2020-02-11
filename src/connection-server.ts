import { Operation, fork, timeout } from 'effection';
import { Mailbox, any } from '@effection/events';
import { IMessage } from 'websocket';
import { assoc, dissoc, lensPath } from 'ramda';

import { createSocketServer, Connection, sendData } from './ws';
import { Atom } from './orchestrator/atom';


interface ConnectionServerOptions {
  atom: Atom;
  port: number;
  proxyPort: number;
  testFilePort: number;
};

const agentsLens = lensPath(['agents']);
let counter = 1;

export function* createConnectionServer(mail: Mailbox, options: ConnectionServerOptions): Operation {
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
      yield sendData(connection, JSON.stringify({
        type: "open",
        url: `http://localhost:${options.proxyPort}`,
        manifest: `http://localhost:${options.testFilePort}/manifest.js`
      }));
    });

    let { message: { data } } = yield messages.receive({ message: { type: 'connected' } });

    let identifier = `agent.${counter++}`;

    try {
      console.debug('[connection] received connection message', data);
      options.atom.over(agentsLens, assoc(identifier, assoc("identifier", identifier, data)));

      while (true) {
        let message = yield messages.receive({ message: any });
        console.debug("[connection] got message", message);
      }
    } finally {
      options.atom.over(agentsLens, dissoc(identifier));
      console.debug('[connection] disconnected');
    }
  }
  yield createSocketServer(options.port, handleConnection, function*() {
    mail.send({ ready: "connection" });
  });
}

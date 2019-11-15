import { Sequence, fork, timeout } from 'effection';
import { on } from '@effection/events';

import { createServer, IncomingMessage, Response } from './http';
import { createSocketServer, Connection, Message, send } from './ws';
import { AddressInfo } from 'net';
import { createProxyServer } from './proxy';
import { agentServer } from './agent-server';

import { log } from './logger';

// entry point for bigtestd
export function* main(): Sequence {
  log.info('BigTest Server');

  // proxies requests to application server and injects our harness
  fork(createProxyServer({
    port: 4001,
    targetPort: 4002,
    inject: '<script src="http://localhost:4004/harness.js"></script>'
  }, (server) => {
    let address = server.address() as AddressInfo;
    log.info(`-> proxy server listening on port ${address.port}`);
  }));

  // accept commands from the outside world (CLI, UI, etc...)
  fork(createServer(4000, commandServer, server => {
    let address = server.address() as AddressInfo;
    log.info(`-> listening for commands on port ${address.port}`);
  }));

  fork(agentServer(4004));


  // TODO: realtime socket communication with browsers
  fork(createSocketServer(5001, connectionServer, server => {
    let address = server.address() as AddressInfo;
    log.info(`-> accepting agent connections on port ${address.port}`);
  }));

  // TODO: serves the raw application
  // fork(buildServer);
}

function* commandServer(req: IncomingMessage, res: Response): Sequence {
  res.writeHead(200, {
    'X-Powered-By': 'effection'
  });
  yield res.end("Your wish is my command\n");
}

function* connectionServer(connection: Connection): Sequence {
  log.info('connection established');
  fork(function* heartbeat() {
    while (true) {
      yield timeout(10000);
      yield send(connection, JSON.stringify({type: "heartbeat"}));
    }
  })

  try {
    while (true) {
      let [message]: [Message] = yield on(connection, "message");
      log.info(`mesage = `, message);
    }
  } finally {
    log.info('connection closed');
  }
}

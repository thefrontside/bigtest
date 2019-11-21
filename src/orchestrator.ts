import { Operation, Sequence, fork, timeout } from 'effection';
import { on } from '@effection/events';

import { createServer, IncomingMessage, Response } from './http';
import { createSocketServer, Connection, Message, send } from './ws';
import { AddressInfo } from 'net';
import { createProxyServer } from './proxy';
import { agentServer } from './agent-server';
import { process } from './process';
import { getCurrentExecution } from './util';

type OrchestratorOptions = {
  appPort: number;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
}

export function createOrchestrator(options: OrchestratorOptions): Operation {
  return function* orchestrator(): Sequence {
    console.log('[orchestrator] starting', getCurrentExecution().id);

    let proxyServerProcess = process((started) => createProxyServer({
      port: options.proxyPort,
      targetPort: options.appPort,
      inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`
    }, started));
    let commandServerProcess = process((started) => createServer(options.commandPort, commandServer, started));
    let connectionServerProcess = process((started) => createSocketServer(options.connectionPort, connectionServer, started))
    let agentServerProcess = fork(agentServer(options.agentPort));

    yield fork(function*() {
      console.log('wait', this.id);
      fork(function*() {
        let server = yield proxyServerProcess.started;
        let address = server.address() as AddressInfo;
        console.log(`[proxy] server listening on port ${address.port}`);
      });

      fork(function*() {
        let server = yield commandServerProcess.started;
        let address = server.address() as AddressInfo;
        console.log(`[command] server listening on port ${address.port}`);
      });

      fork(function*() {
        let server = yield connectionServerProcess.started;
        let address = server.address() as AddressInfo;
        console.log(`[connection] server listening on port ${address.port}`);
      });
    });

    console.log("[orchestrator] running!");
  };

  function* commandServer(req: IncomingMessage, res: Response): Sequence {
    res.writeHead(200, {
      'X-Powered-By': 'effection'
    });
    yield res.end("Your wish is my command\n");
  }

  function* connectionServer(connection: Connection): Sequence {
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
};

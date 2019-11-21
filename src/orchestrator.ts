import { Operation, Sequence, fork } from 'effection';
import { AddressInfo } from 'net';

import { ProxyServer } from './proxy';
import { CommandServer } from './command-server';
import { ConnectionServer } from './connection-server';
import { agentServer } from './agent-server';

type OrchestratorOptions = {
  appPort: number;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
}

export function createOrchestrator(options: OrchestratorOptions): Operation {
  return function* orchestrator(): Sequence {
    console.log('[orchestrator] starting');

    let proxyServer = new ProxyServer({
      port: options.proxyPort,
      targetPort: options.appPort,
      inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
    });
    let commandServer = new CommandServer({
      port: options.commandPort
    });
    let connectionServer = new ConnectionServer({
      port: options.connectionPort,
      proxyPort: options.proxyPort,
    });

    let proxyReady = proxyServer.start();
    let commandReady = commandServer.start();
    let connectionReady = connectionServer.start();

    let agentServerProcess = fork(agentServer(options.agentPort));

    yield fork(function*() {
      fork(function*() {
        yield proxyReady;
        console.log(`[proxy] server listening on port ${proxyServer.options.port}`);
      });

      fork(function*() {
        yield commandReady;
        console.log(`[command] server listening on port ${commandServer.options.port}`);
      });

      fork(function*() {
        yield connectionReady;
        console.log(`[connection] server listening on port ${connectionServer.options.port}`);
      });
    });

    console.log("[orchestrator] running!");
  };


};

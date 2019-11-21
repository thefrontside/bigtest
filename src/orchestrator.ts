import { Operation, Sequence, fork } from 'effection';
import { AddressInfo } from 'net';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createConnectionServer } from './connection-server';
import { agentServer } from './agent-server';
import { process } from './process';

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

    let proxyServerProcess = process((ready) => {
      return createProxyServer({
        port: options.proxyPort,
        targetPort: options.appPort,
        inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
        onReady: ready,
      })
    });
    let commandServerProcess = process((ready) => {
      return createCommandServer({
        port: options.commandPort,
        onReady: ready
      });
    });
    let connectionServerProcess = process((ready) => {
      return createConnectionServer({
        port: options.connectionPort,
        proxyPort: options.proxyPort,
        onReady: ready
      });
    });
    let agentServerProcess = fork(agentServer(options.agentPort));

    yield fork(function*() {
      fork(function*() {
        let server = yield proxyServerProcess.ready;
        let address = server.address() as AddressInfo;
        console.log(`[proxy] server listening on port ${address.port}`);
      });

      fork(function*() {
        let server = yield commandServerProcess.ready;
        let address = server.address() as AddressInfo;
        console.log(`[command] server listening on port ${address.port}`);
      });

      fork(function*() {
        let server = yield connectionServerProcess.ready;
        let address = server.address() as AddressInfo;
        console.log(`[connection] server listening on port ${address.port}`);
      });
    });

    console.log("[orchestrator] running!");
  };


};

import { fork } from 'effection';

import { ProxyServer } from './proxy';
import { CommandServer } from './command-server';
import { ConnectionServer } from './connection-server';
import { agentServer } from './agent-server';

import { Process } from './process';

type OrchestratorOptions = {
  appPort: number;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
}

export class Orchestrator extends Process {
  private proxyServer: ProxyServer;
  private commandServer: CommandServer;
  private connectionServer: ConnectionServer;

  constructor(public options: OrchestratorOptions) {
    super();

    this.proxyServer = new ProxyServer({
      port: this.options.proxyPort,
      targetPort: this.options.appPort,
      inject: `<script src="http://localhost:${this.options.agentPort}/harness.js"></script>`,
    });

    this.commandServer = new CommandServer({
      port: this.options.commandPort
    });

    this.connectionServer = new ConnectionServer({
      port: this.options.connectionPort,
      proxyPort: this.options.proxyPort,
    });
  }

  protected *run(ready) {
    console.log('[orchestrator] starting');

    let { proxyServer, commandServer, connectionServer } = this;

    let proxyReady = proxyServer.start();
    let commandReady = commandServer.start();
    let connectionReady = connectionServer.start();

    fork(agentServer(this.options.agentPort));

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
    ready();

    try {
      yield
    } finally {
      console.log("[orchestrator] shutting down!");
    }
  }
}

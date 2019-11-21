import { fork } from 'effection';

import { ProxyServer } from './proxy';
import { CommandServer } from './command-server';
import { ConnectionServer } from './connection-server';
import { AgentServer } from './agent-server';

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
  private agentServer: AgentServer;

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

    this.agentServer = new AgentServer({
      port: this.options.agentPort,
    });
  }

  protected *run(ready) {
    console.log('[orchestrator] starting');

    let { proxyServer, commandServer, connectionServer, agentServer } = this;

    let proxyReady = proxyServer.start();
    let commandReady = commandServer.start();
    let connectionReady = connectionServer.start();
    let agentReady = agentServer.start();

    yield Promise.all([proxyReady, commandReady, connectionReady, agentReady]);

    console.log("[orchestrator] running!");
    ready();

    try {
      yield
    } finally {
      console.log("[orchestrator] shutting down!");
    }
  }
}

import { Sequence, Operation, Execution } from 'effection';

import { ProxyServer } from './proxy';
import { CommandServer } from './command-server';
import { ConnectionServer } from './connection-server';
import { AgentServer } from './agent-server';

type OrchestratorOptions = {
  appPort: number;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
  delegate?: Execution;
}

export function createOrchestrator(options: OrchestratorOptions): Operation {
  return function *orchestrator(): Sequence {
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

    let agentServer = new AgentServer({
      port: options.agentPort,
    });

    yield Promise.all([
      proxyServer.start(),
      commandServer.start(),
      connectionServer.start(),
      agentServer.start(),
    ]);

    console.log("[orchestrator] running!");

    if(options.delegate) {
      options.delegate.send({ ready: "orchestrator" });
    }

    try {
      yield
    } finally {
      console.log("[orchestrator] shutting down!");
    }
  }
}

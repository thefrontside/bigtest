import { fork, receive, Sequence, Operation, Execution } from 'effection';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { ConnectionServer } from './connection-server';
import { AgentServer } from './agent-server';

type OrchestratorOptions = {
  appPort: number;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
  delegate?: Execution,
}

export function createOrchestrator(options: OrchestratorOptions): Operation {
  return function *orchestrator(): Sequence {
    let orchestrator = this;

    console.log('[orchestrator] starting');

    let proxyServer = fork(createProxyServer(orchestrator, {
      port: options.proxyPort,
      targetPort: options.appPort,
      inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
    }));

    let commandServer = fork(createCommandServer(orchestrator, {
      port: options.commandPort,
    }));

    let connectionServer = new ConnectionServer({
      port: options.connectionPort,
      proxyPort: options.proxyPort,
    });

    let agentServer = new AgentServer({
      port: options.agentPort,
    });

    let connectionReady = connectionServer.start();
    let agentReady = agentServer.start();

    let thing = fork(function*() {
      fork(function*() {
        yield receive(orchestrator, { ready: "proxy" });
        console.log("[orchestrator] proxy started!");
      });
      fork(function*() {
        yield receive(orchestrator, { ready: "command" });
        console.log("[orchestrator] command started!");
      });
      fork(function*() {
        yield connectionReady;
        console.log("[orchestrator] connection started!");
      });
      fork(function*() {
        yield agentReady;
        console.log("[orchestrator] agent started!");
      });
    });

    yield thing;

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

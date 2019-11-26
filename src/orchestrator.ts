import { fork, receive, Sequence, Operation, Execution } from 'effection';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createConnectionServer } from './connection-server';
import { createAgentServer } from './agent-server';

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

    let connectionServer = fork(createConnectionServer(orchestrator, {
      port: options.connectionPort,
      proxyPort: options.proxyPort,
    }));

    let agentServer = fork(createAgentServer(orchestrator, {
      port: options.agentPort,
    }));

    yield fork(function*() {
      fork(function*() {
        yield receive(orchestrator, { ready: "proxy" });
      });
      fork(function*() {
        yield receive(orchestrator, { ready: "command" });
      });
      fork(function*() {
        yield receive(orchestrator, { ready: "connection" });
      });
      fork(function*() {
        yield receive(orchestrator, { ready: "agent" });
      });
    });

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

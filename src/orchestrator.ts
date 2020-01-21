import { fork, receive, Sequence, Operation, Execution } from 'effection';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createConnectionServer } from './connection-server';
import { createAgentServer } from './agent-server';
import { createAppServer } from './app-server';
import { createTestFileWatcher } from './test-file-watcher';
import { createTestFileServer } from './test-file-server';

type OrchestratorOptions = {
  appPort: number;
  appCommand: string;
  appArgs?: string[];
  appEnv?: Record<string, string>;
  appDir?: string;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
  delegate?: Execution;
  testFiles: [string];
  testManifestPath: string;
  testFilePort: number;
}

export function createOrchestrator(options: OrchestratorOptions): Operation {
  return function *orchestrator(): Sequence {
    let orchestrator = this; // eslint-disable-line @typescript-eslint/no-this-alias

    console.log('[orchestrator] starting');

    fork(createProxyServer(orchestrator, {
      port: options.proxyPort,
      targetPort: options.appPort,
      inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
    }));

    fork(createCommandServer(orchestrator, {
      port: options.commandPort,
    }));

    fork(createConnectionServer(orchestrator, {
      port: options.connectionPort,
      proxyPort: options.proxyPort,
      testFilePort: options.testFilePort,
    }));

    fork(createAgentServer(orchestrator, {
      port: options.agentPort,
    }));

    fork(createAppServer(orchestrator, {
      dir: options.appDir,
      command: options.appCommand,
      args: options.appArgs,
      env: options.appEnv,
      port: options.appPort,
    }));

    fork(createTestFileWatcher(orchestrator, {
      files: options.testFiles,
      manifestPath: options.testManifestPath,
    }));

    // wait for manifest before starting test file server
    fork(function*() {
      yield receive(orchestrator, { ready: "manifest" });
    });

    fork(createTestFileServer(orchestrator, {
      files: options.testFiles,
      manifestPath: options.testManifestPath,
      port: options.testFilePort,
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
      fork(function*() {
        yield receive(orchestrator, { ready: "app" });
      });
      fork(function*() {
        yield receive(orchestrator, { ready: "test-files" });
      });
    });

    console.log("[orchestrator] running!");

    if(options.delegate) {
      options.delegate.send({ ready: "orchestrator" });
    }

    try {
      while(true) {
        yield receive(orchestrator);
      }
    } finally {
      console.log("[orchestrator] shutting down!");
    }
  }
}

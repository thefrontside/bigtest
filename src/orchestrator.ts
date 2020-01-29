import { fork, send, receive, Operation, Context } from 'effection';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createConnectionServer } from './connection-server';
import { createAgentServer } from './agent-server';
import { createAppServer } from './app-server';
import { createTestFileWatcher } from './test-file-watcher';
import { createTestFileServer } from './test-file-server';

import { State } from './orchestrator/state';

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
  delegate?: Context;
  testFiles: [string];
  testManifestPath: string;
  testFilePort: number;
}

export function createOrchestrator(options: OrchestratorOptions): Operation {
  return function *orchestrator(): Operation {
    let orchestrator = yield ({ resume, context: { parent }}) => resume(parent);
    let state = new State();
    console.log('[orchestrator] starting');

    yield fork(createProxyServer(orchestrator, {
      port: options.proxyPort,
      targetPort: options.appPort,
      inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
    }));

    yield fork(createCommandServer(orchestrator, {
      port: options.commandPort,
    }));

    yield fork(createConnectionServer(orchestrator, {
      state: state,
      port: options.connectionPort,
      proxyPort: options.proxyPort,
      testFilePort: options.testFilePort,
    }));

    yield fork(createAgentServer(orchestrator, {
      port: options.agentPort,
    }));

    yield fork(createAppServer(orchestrator, {
      dir: options.appDir,
      command: options.appCommand,
      args: options.appArgs,
      env: options.appEnv,
      port: options.appPort,
    }));

    yield fork(createTestFileWatcher(orchestrator, {
      files: options.testFiles,
      manifestPath: options.testManifestPath,
    }));

    // wait for manifest before starting test file server
    yield receive({ ready: "manifest" }, orchestrator);

    yield fork(createTestFileServer(orchestrator, {
      files: options.testFiles,
      manifestPath: options.testManifestPath,
      port: options.testFilePort,
    }));

    yield function*() {
      yield fork(function*() {
        yield receive({ ready: "proxy" }, orchestrator);
      });
      yield fork(function*() {
        yield receive({ ready: "command" }, orchestrator);
      });
      yield fork(function*() {
        yield receive({ ready: "connection" }, orchestrator);
      });
      yield fork(function*() {
        yield receive({ ready: "agent" }, orchestrator);
      });
      yield fork(function*() {
        yield receive({ ready: "app" }, orchestrator);
      });
      yield fork(function*() {
        yield receive({ ready: "test-files" }, orchestrator);
      });
    }

    console.log("[orchestrator] running!");


    let connectionUrl = `ws://localhost:${options.connectionPort}`;
    let agentUrl = `http://localhost:${options.agentPort}/index.html?orchestrator=${encodeURIComponent(connectionUrl)}`
    console.log(`[orchestrator] launch agents via: ${agentUrl}`);

    if(options.delegate) {
      yield send({ ready: "orchestrator" }, options.delegate);
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

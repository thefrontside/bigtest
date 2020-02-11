import { fork, Operation } from 'effection';
import { Mailbox } from '@effection/events';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createConnectionServer } from './connection-server';
import { createAgentServer } from './agent-server';
import { createAppServer } from './app-server';
import { createTestFileWatcher } from './test-file-watcher';
import { createTestFileServer } from './test-file-server';

import { Atom } from './orchestrator/atom';

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
  delegate?: Mailbox;
  testFiles: [string];
  testManifestPath: string;
  testFilePort: number;
}

export function* createOrchestrator(options: OrchestratorOptions): Operation {
  let atom = new Atom();
  console.log('[orchestrator] starting');

  let mail = options.delegate || new Mailbox();

  yield fork(createProxyServer(mail, {
    port: options.proxyPort,
    targetPort: options.appPort,
    inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
  }));

  yield fork(createCommandServer(mail, {
    atom,
    port: options.commandPort,
  }));

  yield fork(createConnectionServer(mail, {
    atom,
    port: options.connectionPort,
    proxyPort: options.proxyPort,
    testFilePort: options.testFilePort,
  }));

  yield fork(createAgentServer(mail, {
    port: options.agentPort,
  }));

  yield fork(createAppServer(mail, {
    dir: options.appDir,
    command: options.appCommand,
    args: options.appArgs,
    env: options.appEnv,
    port: options.appPort,
  }));

  yield fork(createTestFileWatcher(mail, {
    files: options.testFiles,
    manifestPath: options.testManifestPath,
  }));


  yield fork(createTestFileServer(mail, {
    atom,
    manifestPath: options.testManifestPath,
    port: options.testFilePort,
  }));

  yield function*() {
    yield fork(function*() {
      yield mail.receive({ ready: "proxy" });
    });
    yield fork(function*() {
      yield mail.receive({ ready: "command" });
    });
    yield fork(function*() {
      yield mail.receive({ ready: "connection" });
    });
    yield fork(function*() {
      yield mail.receive({ ready: "agent" });
    });
    yield fork(function*() {
      yield mail.receive({ ready: "app" });
    });
    yield fork(function*() {
      yield mail.receive({ ready: "test-files" });
    });
  }

  console.log("[orchestrator] running!");

  let connectionUrl = `ws://localhost:${options.connectionPort}`;
  let agentUrl = `http://localhost:${options.agentPort}/index.html?orchestrator=${encodeURIComponent(connectionUrl)}`
  let commandUrl = `http://localhost:${options.commandPort}`;
  console.log(`[orchestrator] launch agents via: ${agentUrl}`);
  console.log(`[orchestrator] show GraphQL dashboard via: ${commandUrl}`);

  mail.send({ ready: "orchestrator" });

  try {
    while(true) {
      yield mail.receive();
    }
  } finally {
    console.log("[orchestrator] shutting down!");
  }
}

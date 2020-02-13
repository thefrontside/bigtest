import { fork, Operation } from 'effection';
import { Mailbox } from '@effection/events';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createConnectionServer } from './connection-server';
import { createAgentServer } from './agent-server';
import { createAppServer } from './app-server';
import { createManifestGenerator } from './manifest-generator';
import { createManifestServer } from './manifest-server';

import { Atom } from './orchestrator/atom';

type OrchestratorOptions = {
  delegate: Mailbox;
  appPort: number;
  appCommand: string;
  appArgs?: string[];
  appEnv?: Record<string, string>;
  appDir?: string;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  agentPort: number;
  testFiles: [string];
  testManifestPath: string;
  testFilePort: number;
}

export function* createOrchestrator(options: OrchestratorOptions): Operation {
  console.log('[orchestrator] starting');

  let atom = new Atom();

  let proxyServerDelegate = new Mailbox();
  let commandServerDelegate = new Mailbox();
  let connectionServerDelegate = new Mailbox();
  let agentServerDelegate = new Mailbox();
  let appServerDelegate = new Mailbox();
  let manifestGeneratorDelegate = new Mailbox();
  let manifestServerDelegate = new Mailbox();

  yield fork(createProxyServer({
    delegate: proxyServerDelegate,
    port: options.proxyPort,
    targetPort: options.appPort,
    inject: `<script src="http://localhost:${options.agentPort}/harness.js"></script>`,
  }));

  yield fork(createCommandServer({
    delegate: commandServerDelegate,
    atom,
    port: options.commandPort,
  }));

  yield fork(createConnectionServer({
    delegate: connectionServerDelegate,
    atom,
    port: options.connectionPort,
    proxyPort: options.proxyPort,
    testFilePort: options.testFilePort,
  }));

  yield fork(createAgentServer({
    delegate: agentServerDelegate,
    port: options.agentPort,
  }));

  yield fork(createAppServer({
    delegate: appServerDelegate,
    dir: options.appDir,
    command: options.appCommand,
    args: options.appArgs,
    env: options.appEnv,
    port: options.appPort,
  }));

  yield fork(createManifestGenerator({
    delegate: manifestGeneratorDelegate,
    files: options.testFiles,
    manifestPath: options.testManifestPath,
  }));

  // wait for manifest before starting test file server
  yield manifestGeneratorDelegate.receive({ status: 'ready' });
  console.debug('[orchestrator] manifest generator ready');

  yield fork(createManifestServer({
    delegate: manifestServerDelegate,
    atom,
    manifestPath: options.testManifestPath,
    port: options.testFilePort,
  }));

  yield function*() {
    yield fork(function*() {
      yield proxyServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] proxy server ready');
    });
    yield fork(function*() {
      yield commandServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] command server ready');
    });
    yield fork(function*() {
      yield connectionServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] connection server ready');
    });
    yield fork(function*() {
      yield agentServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] agent server ready');
    });
    yield fork(function*() {
      yield appServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] app server ready');
    });
    yield fork(function*() {
      yield manifestServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] manifest server ready');
    });
  }

  console.log("[orchestrator] running!");

  let connectionUrl = `ws://localhost:${options.connectionPort}`;
  let agentUrl = `http://localhost:${options.agentPort}/index.html?orchestrator=${encodeURIComponent(connectionUrl)}`
  let commandUrl = `http://localhost:${options.commandPort}`;
  console.log(`[orchestrator] launch agents via: ${agentUrl}`);
  console.log(`[orchestrator] show GraphQL dashboard via: ${commandUrl}`);

  options.delegate.send({ status: 'ready' });

  try {
    yield;
  } finally {
    console.log("[orchestrator] shutting down!");
  }
}

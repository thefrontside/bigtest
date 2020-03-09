import * as path from 'path';
import { fork, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { AgentServer } from '@bigtest/agent';

import { createProxyServer } from './proxy';
import { createCommandServer } from './command-server';
import { createCommandProcessor } from './command-processor';
import { createConnectionServer } from './connection-server';
import { createAgentServer } from './agent-server';
import { createAppServer } from './app-server';
import { createManifestGenerator } from './manifest-generator';
import { createManifestBuilder } from './manifest-builder';
import { createManifestServer } from './manifest-server';

import { Atom } from './orchestrator/atom';

type OrchestratorOptions = {
  atom: Atom;
  delegate: Mailbox;
  agentPort: number;
  externalAgentServerURL?: string;
  appPort: number;
  appCommand: string;
  appArgs?: string[];
  appEnv?: Record<string, string>;
  appDir?: string;
  proxyPort: number;
  commandPort: number;
  connectionPort: number;
  testFiles: [string];
  manifestPort: number;
  cacheDir: string;
}

export function* createOrchestrator(options: OrchestratorOptions): Operation {
  console.log('[orchestrator] starting');

  let connectionServerInbox = new Mailbox();

  let proxyServerDelegate = new Mailbox();
  let commandServerDelegate = new Mailbox();
  let connectionServerDelegate = new Mailbox();
  let agentServerDelegate = new Mailbox();
  let appServerDelegate = new Mailbox();
  let manifestGeneratorDelegate = new Mailbox();
  let manifestBuilderDelegate = new Mailbox();
  let manifestServerDelegate = new Mailbox();

  let agentServer = AgentServer.create({ port: options.agentPort, externalURL: options.externalAgentServerURL });

  let manifestSrcDir = path.resolve(options.cacheDir, 'manifest/src');
  let manifestBuildDir = path.resolve(options.cacheDir, 'manifest/build');
  let manifestDistDir = path.resolve(options.cacheDir, 'manifest/dist');

  let manifestSrcPath = path.resolve(manifestSrcDir, 'manifest.js');

  yield fork(createAgentServer({
    delegate: agentServerDelegate,
    agentServer
  }));

  yield fork(createProxyServer({
    delegate: proxyServerDelegate,
    port: options.proxyPort,
    targetPort: options.appPort,
    inject: `<script src="${agentServer.harnessScriptURL}"></script>`,
  }));


  yield fork(createCommandServer({
    delegate: commandServerDelegate,
    atom: options.atom,
    port: options.commandPort,
  }));

  yield fork(createConnectionServer({
    delegate: connectionServerDelegate,
    atom: options.atom,
    port: options.connectionPort,
    proxyPort: options.proxyPort,
    manifestPort: options.manifestPort,
  }));

  yield fork(createAppServer({
    delegate: appServerDelegate,
    dir: options.appDir,
    command: options.appCommand,
    args: options.appArgs,
    env: options.appEnv,
    port: options.appPort,
  }));

  yield fork(createManifestServer({
    delegate: manifestServerDelegate,
    dir: manifestDistDir,
    port: options.manifestPort,
  }));

  yield fork(createManifestGenerator({
    delegate: manifestGeneratorDelegate,
    files: options.testFiles,
    destinationPath: manifestSrcPath,
  }));

  console.debug('[orchestrator] wait for manifest generator');
  // wait for manifest generator before starting manifest builder
  yield manifestGeneratorDelegate.receive({ status: 'ready' });
  console.debug('[orchestrator] manifest generator ready');

  yield fork(createManifestBuilder({
    delegate: manifestBuilderDelegate,
    atom: options.atom,
    srcPath: manifestSrcPath,
    distDir: manifestDistDir,
    buildDir: manifestBuildDir,
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
      yield appServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] app server ready');
    });
    yield fork(function*() {
      yield manifestBuilderDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] manifest builder ready');
    });
    yield fork(function*() {
      yield manifestServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] manifest server ready');
    });
  }

  console.log("[orchestrator] running!");

  let commandUrl = `http://localhost:${options.commandPort}`;
  let connectUrl = agentServer.connectURL(`ws://localhost:${options.connectionPort}`);
  console.log(`[orchestrator] launch agents via: ${connectUrl}`);
  console.log(`[orchestrator] show GraphQL dashboard via: ${commandUrl}`);

  options.delegate.send({ status: 'ready' });

  try {
    yield createCommandProcessor({
      proxyPort: options.proxyPort,
      manifestPort: options.manifestPort,
      atom: options.atom,
      inbox: commandServerDelegate, // note that this is intentionally inverted
      delegate: connectionServerInbox,
    });
  } finally {
    console.log("[orchestrator] shutting down!");
  }
}

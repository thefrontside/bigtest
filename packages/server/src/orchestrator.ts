import * as path from 'path';
import { fork, Operation, spawn } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { AgentServerConfig } from '@bigtest/agent';
import { Atom } from '@bigtest/atom';
import { ProjectOptions } from '@bigtest/project';

import { proxyServer } from './proxy';
import { createBrowserManager, BrowserManager } from './browser-manager';
import { createCommandServer } from './command-server';
import { createCommandProcessor } from './command-processor';
import { createConnectionServer } from './connection-server';
import { appServer } from './app-server';
import { manifestGenerator } from './manifest-generator';
import { createManifestBuilder } from './manifest-builder';
import { createManifestServer } from './manifest-server';
import { createLogger } from './logger';
import { OrchestratorState } from './orchestrator/state';


type OrchestratorOptions = {
  atom: Atom<OrchestratorState>;
  delegate?: Mailbox;
  project: Omit<ProjectOptions, 'app'>;
}

export function* createOrchestrator(options: OrchestratorOptions): Operation {
  console.log('[orchestrator] starting');

  let connectionServerInbox = new Mailbox();

  let commandServerDelegate = new Mailbox();
  let connectionServerDelegate = new Mailbox();
  let manifestServerDelegate = new Mailbox();

  let agentServerConfig = new AgentServerConfig(options.project.proxy);

  let manifestSrcDir = path.resolve(options.project.cacheDir, 'manifest/src');
  let manifestBuildDir = path.resolve(options.project.cacheDir, 'manifest/build');
  let manifestDistDir = path.resolve(options.project.cacheDir, 'manifest/dist');

  let manifestSrcPath = path.resolve(manifestSrcDir, 'manifest.js');

  let connectTo = `ws://localhost:${options.project.connection.port}`;

  yield spawn(createLogger({ atom: options.atom, out: console.error }));

  let browserManager: BrowserManager = yield createBrowserManager({
    atom: options.atom,
    connectURL: (agentId: string) => agentServerConfig.agentUrl(connectTo, agentId),
    drivers: options.project.drivers,
    launch: options.project.launch
  });

  yield fork(proxyServer(options.atom.slice('proxyService')));

  yield fork(createCommandServer({
    delegate: commandServerDelegate,
    atom: options.atom,
    port: options.project.port,
  }));

  yield fork(createConnectionServer({
    inbox: connectionServerInbox,
    delegate: connectionServerDelegate,
    atom: options.atom,
    port: options.project.connection.port,
    proxyPort: options.project.proxy.port,
    manifestPort: options.project.manifest.port,
  }));

  yield fork(appServer(options.atom.slice('appService')));

  yield fork(createManifestServer({
    delegate: manifestServerDelegate,
    dir: manifestDistDir,
    port: options.project.manifest.port,
    proxyPort: options.project.proxy.port,
  }));

  yield fork(manifestGenerator(options.atom.slice('manifestGenerator')));

  console.debug('[orchestrator] wait for manifest generator');
  yield options.atom.slice('manifestGenerator', 'status').once(({ type }) => type === 'ready');
  console.debug('[orchestrator] manifest generator ready');

  yield fork(createManifestBuilder({
    watch: options.project.watchTestFiles,
    atom: options.atom,
    srcPath: manifestSrcPath,
    distDir: manifestDistDir,
    buildDir: manifestBuildDir,
  }));

  yield function* () {
    yield fork(function* () {
      yield options.atom.slice("proxyService", "status").once(({ type }) => type === 'started');
      console.debug('[orchestrator] proxy server ready');
    });
    yield fork(function* () {
      yield commandServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] command server ready');
    });
    yield fork(function* () {
      yield connectionServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] connection server ready');
    });
    yield fork(function*() {
      let status = yield options.atom.slice('appService', 'status').once((status) => {
        return status.type === 'ready' || status.type === 'exited';
      });
      console.debug(`[orchestrator] app server ${status.type}`);
    });
    yield fork(function* () {
      yield options.atom.slice('bundler').once(({ type }) => type === 'GREEN' || type === 'ERRORED');
      console.debug('[orchestrator] manifest builder ready');
    });
    yield fork(function* () {
      yield manifestServerDelegate.receive({ status: 'ready' });
      console.debug('[orchestrator] manifest server ready');
    });
    yield fork(function* () {
      yield browserManager.ready();
      console.debug('[orchestrator] browser manager ready');
    })
  }

  console.log("[orchestrator] running!");

  let commandUrl = `http://localhost:${options.project.port}`;
  let connectURL = agentServerConfig.agentUrl(connectTo);

  console.log(`[orchestrator] launch agents via: ${connectURL}`);
  console.log(`[orchestrator] show GraphQL dashboard via: ${commandUrl}`);

  options.delegate && options.delegate.send({ status: 'ready' });

  let commandProcessorEvents = new Mailbox();
  commandProcessorEvents.setMaxListeners(100000);
  yield connectionServerDelegate.pipe(commandProcessorEvents);

  let commandProcessorCommands = new Mailbox();
  yield commandServerDelegate.pipe(commandProcessorCommands);

  try {
    yield createCommandProcessor({
      proxyPort: options.project.proxy.port,
      manifestPort: options.project.manifest.port,
      atom: options.atom,
      events: commandProcessorEvents,
      commands: commandProcessorCommands,
      delegate: connectionServerInbox,
      testFiles: options.project.testFiles,
    });
  } finally {
    console.log("[orchestrator] shutting down!");
  }
}

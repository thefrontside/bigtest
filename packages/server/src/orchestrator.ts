import path from 'path';
import { Operation, spawn, all } from 'effection';
import { AgentServerConfig } from '@bigtest/agent';
import { Slice } from '@effection/atom';
import { ProjectOptions } from '@bigtest/project';

import { proxyServer } from './proxy';
import { createBrowserManager, BrowserManager } from './browser-manager';
import { createCommandServer } from './command-server';
import { createConnectionServer, ConnectionServer } from './connection-server';
import { appServer } from './app-server';
import { manifestGenerator } from './manifest-generator';
import { createManifestBuilder } from './manifest-builder';
import { createManifestServer } from './manifest-server';
import { createLogger } from './logger';
import { OrchestratorState } from './orchestrator/state';
import { createAgentRunner } from './runner';

type OrchestratorOptions = {
  atom: Slice<OrchestratorState>;
  project: ProjectOptions;
}

export function* createOrchestrator(options: OrchestratorOptions): Operation<void> {
  console.log('[orchestrator] starting');

  let status = options.atom.slice('status');

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

  yield spawn(proxyServer({
    status: options.atom.slice('proxyServer'),
    target: options.project.app.url,
    port: options.project.proxy.port,
    agentServerConfig,
  }));

  let connectionServer: ConnectionServer = yield createConnectionServer({
    status: options.atom.slice('connectionServer'),
    agents: options.atom.slice('agents'),
    port: options.project.connection.port,
    proxyPort: options.project.proxy.port,
    manifestPort: options.project.manifest.port,
  });

  let runner = yield createAgentRunner({
    proxyPort: options.project.proxy.port,
    manifestPort: options.project.manifest.port,
    atom: options.atom,
    channel: connectionServer.channel,
    testFiles: options.project.testFiles,
  });

  yield spawn(createCommandServer({
    status: options.atom.slice('commandServer'),
    runner,
    atom: options.atom,
    port: options.project.port,
  }));

  yield spawn(appServer({
    status: options.atom.slice('appServer'),
    ...options.project.app,
  }));

  yield spawn(createManifestServer({
    status: options.atom.slice('manifestServer'),
    dir: manifestDistDir,
    port: options.project.manifest.port,
    proxyPort: options.project.proxy.port,
  }));

  yield spawn(manifestGenerator({
    status: options.atom.slice('manifestGenerator'),
    destinationPath: manifestSrcPath,
    mode: options.project.watchTestFiles ? 'watch' : 'build',
    files: options.project.testFiles,
  }));

  console.debug('[orchestrator] wait for manifest generator');
  yield options.atom.slice('manifestGenerator').match({ type: 'ready' }).expect();
  console.debug('[orchestrator] manifest generator ready');

  yield spawn(createManifestBuilder({
    status: options.atom.slice('bundler'),
    manifest: options.atom.slice('manifest'),
    watch: options.project.watchTestFiles,
    srcPath: manifestSrcPath,
    distDir: manifestDistDir,
    buildDir: manifestBuildDir,
    tsconfig: options.project.tsconfig
  }));

  yield all([
    function*() {
      yield options.atom.slice("proxyServer").match({ type: 'started' }).expect();
      console.debug('[orchestrator] proxy server ready');
    },
    function*() {
      yield options.atom.slice("commandServer").match({ type: 'started' }).expect();
      console.debug('[orchestrator] command server ready');
    },
    function*() {
      yield options.atom.slice("connectionServer").match({ type: 'started' }).expect();
      console.debug('[orchestrator] connection server ready');
    },
    function*() {
      let status = yield options.atom.slice('appServer').filter((status) => {
        return status.type === 'started' || status.type === 'available' || status.type === 'exited';
      }).expect();
      console.debug(`[orchestrator] app server ${status.type}`);
    },
    function*() {
      yield options.atom.slice("manifestServer").match({ type: 'started' }).expect();
      console.debug('[orchestrator] manifest server ready');
    },
    function*() {
      yield browserManager.ready();
      console.debug('[orchestrator] browser manager ready');
    },
  ]);

  console.log("[orchestrator] running!");

  let commandUrl = `http://localhost:${options.project.port}`;
  let connectURL = agentServerConfig.agentUrl(connectTo);

  console.log(`[orchestrator] launch agents via: ${connectURL}`);
  console.log(`[orchestrator] show GraphQL dashboard via: ${commandUrl}`);

  status.set({ type: 'ready' });

  try {
    yield;
  } finally {
    console.log("[orchestrator] shutting down!");
  }
}

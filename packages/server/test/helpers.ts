import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { Context, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { beforeEach, afterEach } from 'mocha';
import { w3cwebsocket } from 'websocket';
import { Agent } from '@bigtest/agent';
import { World } from './helpers/world';

import { createOrchestrator } from '../src/index';
import { createOrchestratorAtom, OrchestratorAtomOptions } from '../src/orchestrator/atom';
import { AppOptions } from '../src/orchestrator/state';
import merge from 'deepmerge';

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

const TestProjectOptions: OrchestratorAtomOptions = {
  app: {
    url: "http://localhost:24100",
    command: "yarn test:app:start 24100",
  },
  testFiles: ["test/fixtures/*.t.js"],
  cacheDir: "./tmp/test/orchestrator",
  watchTestFiles: true,
  proxy: {
    port: 24001,
    prefix: '/__bigtest/'
  }
}

export const getTestProjectOptions = (overrides: DeepPartial<OrchestratorAtomOptions> = {}): OrchestratorAtomOptions =>
  merge(TestProjectOptions, overrides) as OrchestratorAtomOptions;

export const actions = {
  atom: createOrchestratorAtom(getTestProjectOptions()),

  fork<T>(operation: Operation<T>): Context<T> {
    return currentWorld.fork(operation);
  },

  receive(mailbox: Mailbox, pattern: unknown): Context {
    return actions.fork(mailbox.receive(pattern));
  },

  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response> {
    return actions.fork(currentWorld.fetch(resource, init));
  },

  async createAgent(agentId: string): Promise<Agent> {
    // the types are broken in the 'websocket' package.... the `w3cwebsocket` class
    // _is_ in fact an EventTarget, but it is not declared as such. So we have
    // to dynamically cast it.
    type W3CWebSocket = w3cwebsocket & EventTarget;
    let createSocket = () => new w3cwebsocket(`http://localhost:24103`) as W3CWebSocket;

    return actions.fork(Agent.start({
      createSocket,
      agentId,
      data: {}
    }));
  },

  updateApp(appOptions: AppOptions): void {
    actions.atom
      .slice("appService", "options")
      .update(() => appOptions);

    actions.atom
      .slice('proxyService', 'options', 'appOptions')
      .update(() => appOptions);
  },

  async startOrchestrator(): Promise<any> {
    let delegate = new Mailbox();

    this.fork(createOrchestrator({
      delegate,
      atom: this.atom,
      project: {
        port: 24102,
        testFiles: ["test/fixtures/*.t.js"],
        proxy: {
          ...TestProjectOptions.proxy
        },
        cacheDir: "./tmp/test/orchestrator",
        watchTestFiles: true,
        manifest: {
          port: 24105,
        },
        connection: {
          port: 24103,
        },
        drivers: {},
        launch: [],
        coverage: { reports: [], directory: "" }
      }
    }));

    await this.receive(delegate, { status: 'ready' });
  }
}

let currentWorld: World;

beforeEach(() => {
  currentWorld = new World();
});

afterEach(() => {
  if(currentWorld.execution.state === 'errored') {
    throw currentWorld.execution.result;
  }
  currentWorld.destroy();
});

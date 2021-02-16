import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { Context, Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { Mailbox } from '@bigtest/effection';
import { beforeEach, afterEach } from 'mocha';
import { w3cwebsocket } from 'websocket';
import { Agent } from '@bigtest/agent';
import { World } from './helpers/world';

import { createOrchestrator } from '../src/index';
import { createOrchestratorAtom, DeepPartial } from '../src/orchestrator/atom';
import merge from 'deepmerge';

export const actions = {
  atom: createOrchestratorAtom(),

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

  async startOrchestrator(overrides?: DeepPartial<ProjectOptions>): Promise<any> {
    this.atom = createOrchestratorAtom();

    let options: ProjectOptions = {
      port: 24102,
      testFiles: ["test/fixtures/*.t.js"],
      app: {
        url: "http://localhost:24100",
      },
      proxy: {
        port: 24001,
        prefix: '/__bigtest/'
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
    };

    this.fork(createOrchestrator({
      atom: this.atom,
      project: merge(options, overrides || {}),
    }));

    await this.fork(this.atom.slice('status', 'type').once(type => type === 'ready'));
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

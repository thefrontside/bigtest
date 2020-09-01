import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { Context, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { beforeEach, afterEach } from 'mocha';
import { w3cwebsocket } from 'websocket';
import { Agent } from '@bigtest/agent';

import { World } from './helpers/world';

import { createOrchestrator } from '../src/index';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { AppOptions } from '../src/orchestrator/state';
import { Manifest } from '../src/orchestrator/state';

let orchestratorPromise: Context;
let manifest: Manifest;

export const actions = {
  atom: createOrchestratorAtom({
    app: {
      url: "http://localhost:24100",
      command: "yarn test:app:start 24100",
    },
  }),

  fork<T>(operation: Operation<T>): Context<T> {
    return currentWorld.fork(operation);
  },

  receive(mailbox: Mailbox, pattern: unknown) {
    return actions.fork(mailbox.receive(pattern));
  },

  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response> {
    return actions.fork(currentWorld.fetch(resource, init));
  },

  async createAgent(agentId: string) {
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

  updateApp(appOptions: AppOptions) {
    actions.atom
      .slice("appService", "appOptions")
      .update(() => appOptions);
  },

  async startOrchestrator() {
    if(!orchestratorPromise) {
      let delegate = new Mailbox();

      globalWorld.fork(createOrchestrator({
        delegate,
        atom: this.atom,
        project: {
          port: 24102,
          testFiles: ["test/fixtures/*.t.js"],
          cacheDir: "./tmp/test/orchestrator",
          manifest: {
            port: 24105,
          },
          proxy: {
            port: 24101,
          },
          connection: {
            port: 24103,
          },
          drivers: {},
          launch: []
        }
      }));

      orchestratorPromise = this.receive(delegate, { status: 'ready' });
    }
    return orchestratorPromise.then(cxt => {
      manifest = actions.atom.get().manifest;
      return cxt;
    });
  }
}

let globalWorld = new World();
let currentWorld: World;

after(async function() {
  globalWorld.destroy();
});

beforeEach(() => {
  actions.atom.reset(initial => ({ ...initial, manifest }));

  currentWorld = new World();
});

afterEach(() => {
  if(globalWorld.execution.state === 'errored') {
    throw globalWorld.execution.result;
  }
  if(currentWorld.execution.state === 'errored') {
    throw currentWorld.execution.result;
  }
  currentWorld.destroy();
});

import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { Context, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { beforeEach, afterEach } from 'mocha';
import { w3cwebsocket } from 'websocket';
import { Agent } from '@bigtest/agent';

import { World } from './helpers/world';

import { createOrchestrator } from '../src/index';
import { Atom } from '../src/orchestrator/atom';
import { Manifest } from '../src/orchestrator/state';
import { Client } from '../src/client';

import { Subscription } from './helpers/subscription';
export { Subscription } from './helpers/subscription';

interface Actions {
  atom: Atom;
  fork<Result>(operation: Operation<Result>): Context<Result>;
  receive(mailbox: Mailbox, pattern: unknown): PromiseLike<unknown>;
  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response>;
  query(source: string, until?: (data: any) => boolean): PromiseLike<any>;
  subscribe<Shape>(source: string, extract: (result: unknown) => Shape): PromiseLike<Subscription<Shape>>;
  createAgent(): PromiseLike<Agent>;
  createClient(): PromiseLike<Client>;
  startOrchestrator(): PromiseLike<Context>;
}

let orchestratorPromise: Context;
let manifest: Manifest;

export const actions: Actions = {
  atom: new Atom(),

  fork(operation: Operation): Context {
    return currentWorld.fork(operation);
  },

  receive(mailbox: Mailbox, pattern): PromiseLike<unknown> {
    return actions.fork(mailbox.receive(pattern));
  },

  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response> {
    return actions.fork(currentWorld.fetch(resource, init));
  },

  async query(source: string, until: (data: any) => boolean = () => true) {
    let client = await this.createClient();

    return actions.fork(function*() {
      while (true) {
        let data = yield client.query(source);
        if (until(data)) {
          return data;
        }
      }
    });
  },

  async subscribe<Shape>(source: string, extract: (result: unknown) => Shape = x => x as Shape) {
    let client = await this.createClient();
    return actions.fork(Subscription.create(client, source, extract));
  },

  async createClient(): Promise<Client> {
    if (!this.client) {
      this.client = await actions.fork(Client.create(`http://localhost:24102`));
      currentWorld.ensure(() => delete this.client);
    }
    return this.client;
  },

  async createAgent() {
    // the types are broken in the 'websocket' package.... the `w3cwebsocket` class
    // _is_ in fact an EventTarget, but it is not declared as such. So we have
    // to dynamically cast it.
    type W3CWebSocket = w3cwebsocket & EventTarget;
    let socket = new w3cwebsocket(`http://localhost:24103`) as W3CWebSocket;

    return actions.fork(Agent.start(socket));
  },

  async startOrchestrator() {
    if(!orchestratorPromise) {
      let delegate = new Mailbox();

      globalWorld.fork(createOrchestrator({
        delegate,
        atom: this.atom,
        appCommand: "yarn",
        appArgs: ['test:app:start', '24100'],
        appPort: 24100,
        testFiles: ["test/fixtures/*.t.js"],
        cacheDir: "./tmp/test/orchestrator",
        manifestPort: 24105,
        proxyPort: 24101,
        commandPort: 24102,
        connectionPort: 24103,
        agentPort: 24104,
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
  //reset all the state in the global atom, except for the manifest
  actions.atom.reset(initial => ({ ...initial, manifest }));

  currentWorld = new World();
});

afterEach(() => {
  currentWorld.destroy();
});

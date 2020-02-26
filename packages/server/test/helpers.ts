import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { Context, Operation } from 'effection';
import { World } from './helpers/world';

import { beforeEach, afterEach } from 'mocha';

import { createOrchestrator } from '../src/index';
import { Mailbox } from '../src/effection/events';
import { Atom } from '../src/orchestrator/atom';

interface Actions {
  atom: Atom;
  fork(operation: Operation): Context;
  receive(mailbox: Mailbox, pattern: unknown): PromiseLike<unknown>;
  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response>;
  startOrchestrator(): PromiseLike<Context>;
}

let orchestratorPromise: Context;

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

  startOrchestrator() {
    if(!orchestratorPromise) {
      let delegate = new Mailbox();

      globalWorld.fork(createOrchestrator({
        delegate,
        atom: this.atom,
        appCommand: "bigtest-todomvc 24100",
        appDir: "test/app",
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
    return orchestratorPromise;
  }
}

let globalWorld = new World();
let currentWorld: World;

after(async function() {
  globalWorld.destroy();
});

beforeEach(() => {
  currentWorld = new World();
});

afterEach(() => {
  currentWorld.destroy();
});

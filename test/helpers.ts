import { Response, RequestInfo, RequestInit } from 'node-fetch';
import { Context, Operation } from 'effection';
import { World } from './helpers/world';

import { beforeEach, afterEach } from 'mocha';

import { createOrchestrator } from '../src/index';
import { Mailbox } from '../src/effection/events';

interface Actions {
  fork<T>(operation: Operation): Context;
  receive(mailbox: Mailbox, pattern: any): PromiseLike<any>;
  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response>;
  startOrchestrator(): PromiseLike<Context>;
}

let orchestratorPromise: Context;

export const actions: Actions = {
  fork(operation: Operation): Context {
    return currentWorld.fork(operation);
  },

  receive(mailbox: Mailbox, pattern): PromiseLike<any> {
    return actions.fork(mailbox.receive(pattern));
  },

  fetch(resource: RequestInfo, init?: RequestInit): PromiseLike<Response> {
    return actions.fork(currentWorld.fetch(resource, init));
  },

  startOrchestrator() {
    if(!orchestratorPromise) {
      let mail = new Mailbox();
      orchestratorPromise = globalWorld.fork(function*() {
        yield mail.receive({ status: 'ready' });
      });

      globalWorld.fork(createOrchestrator({
        delegate: mail,
        appCommand: "bigtest-todomvc 24100",
        appEnv: {  },
        appDir: "test/app",
        appPort: 24100,
        testFiles: ["test/fixtures/*.t.js"],
        manifestPath: "./tmp/orchestrator/src/manifest.js",
        manifestDistPath: "./tmp/orchestrator/dist",
        manifestPort: 24105,
        proxyPort: 24101,
        commandPort: 24102,
        connectionPort: 24103,
        agentPort: 24104,
      }));
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

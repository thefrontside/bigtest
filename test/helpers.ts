import { AbortController } from 'abort-controller';
import fetch, { Response } from 'node-fetch';
import { fork, Execution, Operation } from 'effection';

import { beforeEach, afterEach } from 'mocha';

import { setLogLevel } from '../src/log-level';

import { Orchestrator } from '../src/orchestrator';

interface Actions {
  orchestrator: Orchestrator,
  fork(operation: Operation): Execution;
  get(url: string): Promise<Response>;
  startOrchestrator(): Promise<any>;
}

class World {
  execution: Execution;
  constructor() {
    this.execution = fork(function*() { yield; });
  }

  destroy() {
    this.execution.halt();
  }

  fork(operation: Operation): Execution {
    return (this.execution as any).fork(operation);
  }

  get(url: string): Promise<Response>{
    return this.request('get', url);
  }

  request(method: RequestMethod, url: string): Promise<Response> {
    let controller = new AbortController();
    let { signal } = controller;
    let result = fetch(url, { method, signal });

    this.fork(function* abortListener() {
      try {
        yield result;
      } finally {
        controller.abort();
      }
    });

    return result;
  }
}

type RequestMethod = 'post' | 'get';

export const actions: Actions = {
  orchestrator: new Orchestrator({
    appPort: 24100,
    proxyPort: 24101,
    commandPort: 24102,
    connectionPort: 24103,
    agentPort: 24104,
  }),

  fork(operation: Operation): Execution {
    return currentWorld.fork(operation);
  },

  get(url: string): Promise<Response> {
    return currentWorld.get(url);
  },

  startOrchestrator(): Promise<any> {
    // TODO: this is a rather silly way of starting the Orchestrator, but we
    // must ensure that it is running within the world.
    let orchestrator = this.orchestrator;
    return new Promise((resolve, reject) => {
      this.fork(function*() {
        orchestrator.start().then(resolve, reject);
      });
    });
  }
}

let currentWorld: World;
let info: (...args: unknown[]) => void;

beforeEach(() => {
  setLogLevel("warn");
  currentWorld = new World();
});

afterEach(() => {
  currentWorld.destroy();
})

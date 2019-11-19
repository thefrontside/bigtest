import { AbortController } from 'abort-controller';
import fetch, { Response } from 'node-fetch';
import { fork, Execution, Operation } from 'effection';

import { beforeEach, afterEach } from 'mocha';

import { setLogLevel } from '../src/log-level';

interface Actions {
  fork(operation: Operation): this;
  get(url: string): Promise<Response>;
}

class World implements Actions {
  execution: Execution;
  constructor() {
    this.execution = fork(function*() { yield; });
  }

  destroy() {
    this.execution.halt();
  }

  fork(operation: Operation): this {
    (this.execution as any).fork(operation);
    return this;
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
  fork(operation: Operation) {
    return currentWorld.fork(operation);
  },

  get(url: string): Promise<Response> {
    return currentWorld.get(url);
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

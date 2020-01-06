import { AbortController } from 'abort-controller';
import fetch, { Response } from 'node-fetch';
import { fork, receive, Execution, Operation } from 'effection';

import { beforeEach, afterEach } from 'mocha';

import { setLogLevel } from '../src/log-level';

import { createOrchestrator } from '../src/index';

interface Actions {
  fork(operation: Operation): Execution;
  get(url: string): Promise<Response>;
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
  fork(operation: Operation): Execution {
    return currentWorld.fork(operation);
  },

  get(url: string): Promise<Response> {
    return currentWorld.get(url);
  },
}

let globalWorld = new World();
let currentWorld: World;
let info: (...args: unknown[]) => void;

before(async function() {
  this.timeout(20000);
  setLogLevel("warn");
  let readiness = globalWorld.fork(function*() {
    yield receive({ ready: "orchestrator" });
  });

  globalWorld.fork(createOrchestrator({
    delegate: readiness,
    appCommand: "react-scripts start",
    appEnv: { "PORT": "24100", "BROWSER": "none" },
    appDir: "test/app",
    appPort: 24100,
    proxyPort: 24101,
    commandPort: 24102,
    connectionPort: 24103,
    agentPort: 24104,
  }));

  await readiness;
});

after(async function() {
  globalWorld.destroy();
});

beforeEach(() => {
  setLogLevel("warn");
  currentWorld = new World();
});

afterEach(() => {
  currentWorld.destroy();
})

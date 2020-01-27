import { Response } from 'node-fetch';
import { receive, Context, Operation } from 'effection';
import { World } from './helpers/world';

import { beforeEach, afterEach } from 'mocha';

import { createOrchestrator } from '../src/index';

interface Actions {
  fork<T>(operation: Operation): PromiseLike<T>;
  get(url: string): PromiseLike<Response>;
  startOrchestrator(): PromiseLike<Context>;
}

let orchestratorPromise;

export const actions: Actions = {
  fork(operation: Operation): Context {
    return currentWorld.fork(operation);
  },

  get(url: string): Promise<Response> {
    return currentWorld.get(url);
  },

  startOrchestrator() {
    if(!orchestratorPromise) {
      orchestratorPromise = globalWorld.fork(function*() {
        yield receive({ ready: "orchestrator" });
      });

      globalWorld.fork(createOrchestrator({
        delegate: orchestratorPromise,
        appCommand: "react-scripts start",
        appEnv: { "PORT": "24100", "BROWSER": "none" },
        appDir: "test/app",
        appPort: 24100,
        testFiles: ["test/fixtures/*.t.ts"],
        testManifestPath: "test/manifest.js",
        proxyPort: 24101,
        commandPort: 24102,
        connectionPort: 24103,
        agentPort: 24104,
        testFilePort: 24105,
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

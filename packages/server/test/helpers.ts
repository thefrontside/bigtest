import { Resource, Operation, spawn, createFuture } from 'effection';
import { Slice } from '@effection/atom';
import { ProjectOptions } from '@bigtest/project';
import { w3cwebsocket } from 'websocket';
import { createAgent as createAgentInternal, AgentProtocol, AgentOptions } from '@bigtest/agent';

import { createOrchestrator } from '../src/index';
import { createOrchestratorAtom, DeepPartial } from '../src/orchestrator/atom';
import { OrchestratorState } from '../src/orchestrator/state';
import merge from 'deepmerge';
import rimraf from 'rimraf';

export function rmrf(path: string): Operation<undefined> {
  let { future, resolve, reject } = createFuture<undefined>();
  rimraf(path, (err) => {
    if(err) {
      reject(err);
    } else {
      resolve(undefined);
    }
  });
  return future;
}

export function createAgent(options: AgentOptions): Resource<AgentProtocol> {
  // the types are broken in the 'websocket' package.... the `w3cwebsocket` class
  // _is_ in fact an EventTarget, but it is not declared as such. So we have
  // to dynamically cast it.
  type W3CWebSocket = w3cwebsocket & EventTarget;
  let socket = new w3cwebsocket(`http://localhost:24103`) as W3CWebSocket;
  socket.addEventListener('open', () => {
    console.log("*** SOCKET DID OPEN ***");
  });
  socket.addEventListener('message', (m) => {
    console.log("*** SOCKET GOT MESSAGE ***", m);
  });

  return createAgentInternal(socket, options);
};

export function startOrchestrator(overrides?: DeepPartial<ProjectOptions>): Resource<Slice<OrchestratorState>> {
  return {
    *init() {
      let atom = createOrchestratorAtom();
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

      yield spawn(createOrchestrator({
        atom,
        project: merge(options, overrides || {}),
      }));

      yield atom.slice('status').match({ type: 'ready' }).expect();

      return atom;
    }
  }
}

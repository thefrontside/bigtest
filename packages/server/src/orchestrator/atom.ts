import { createAtom, Slice } from "@bigtest/atom";
import { OrchestratorState } from "./state";
import merge from 'deepmerge';

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

export function createOrchestratorAtom(overrides?: DeepPartial<OrchestratorState>): Slice<OrchestratorState> {
  let options: OrchestratorState = {
    manifest: {
      description: "None",
      fileName: "<init>",
      steps: [],
      assertions: [],
      children: [],
    },
    agents: {},
    testRuns: {},
    bundler: {
      type: 'UNBUNDLED'
    },
    manifestGenerator: {
      type: 'pending',
    },
    appServer: {
      type: 'pending',
    },
    proxyServer: {
      type: 'unstarted',
    },
    connectionServer: {
      type: 'unstarted',
    },
    commandServer: {
      type: 'unstarted',
    },
    manifestServer: {
      type: 'unstarted',
    },
    status: {
      type: 'pending',
    }
  };
  return createAtom<OrchestratorState>(merge(options, overrides || {}));
}

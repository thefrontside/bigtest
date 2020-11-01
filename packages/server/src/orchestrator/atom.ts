import { Atom } from "@bigtest/atom";
import { AppOptions, OrchestratorState } from "./state";

interface OrchestratorAtomOptions {
  app?: AppOptions;
}

export const createOrchestratorAtom = (options?: OrchestratorAtomOptions) => {
  let atom = new Atom<OrchestratorState>({
    manifestGenerator: {
      status: { type: 'pending' },
      options: {
        mode: 'idle'
      }
    },
    manifest: {
      description: "None",
      fileName: "<init>",
      steps: [],
      assertions: [],
      children: [],
    },
    bundler: {
      type: 'UNBUNDLED'
    },
    appService: {
      status: { type: 'pending' },
      options: options?.app || {},
    },
    proxyService: {
      proxyStatus: 'unstarted'
    },
    agents: {},
    testRuns: {},
  });
  atom.setMaxListeners(100000);

  return atom;
}

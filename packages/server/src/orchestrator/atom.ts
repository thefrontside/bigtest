import { Atom } from "@bigtest/atom";
import { AppOptions, OrchestratorState } from "./state";

interface OrchestratorAtomOptions {
  app?: AppOptions;
}

export const createOrchestratorAtom = (options?: OrchestratorAtomOptions) => {
  let atom = new Atom<OrchestratorState>({
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
      appStatus: 'unstarted',
      appOptions: options?.app || {},
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

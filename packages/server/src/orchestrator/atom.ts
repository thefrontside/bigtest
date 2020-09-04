import { Atom } from "@bigtest/atom";
import { defaultApp } from '@bigtest/project'
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
      errors: [],
    },
    bundler: {
      type: 'UNBUNDLED'
    },
    appService: {
      appStatus: 'unstarted',
      appOptions: options?.app ?? defaultApp,
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

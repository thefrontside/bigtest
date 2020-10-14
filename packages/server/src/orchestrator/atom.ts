import { Atom } from "@bigtest/atom";
import { AppOptions, OrchestratorState, CommandServerState } from "./state";

type OrchestratorAtomOptions = {
  app?: AppOptions;
} & CommandServerState;

export const createOrchestratorAtom = (options: OrchestratorAtomOptions) => {
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
      id: '@bigtest/app-service',
      name: '[app service]',
      status: { type: 'unstarted' },
      appOptions: options?.app || {},
    },
    commandService: {
      id: '@bigtest/command-service',
      name: '[command service]',
      status: { type: 'unstarted' },
      port: options.port
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

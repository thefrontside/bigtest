import { Atom } from "@bigtest/atom";
import { OrchestratorState } from "./state";

export const createOrchestratorAtom = () => {
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
      appStatus: 'unstarted'
    },
    agents: {},
    testRuns: {},
  });
  atom.setMaxListeners(100000);
  return atom;
}

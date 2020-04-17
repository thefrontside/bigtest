import { Atom, Slice as _Slice } from "@bigtest/atom";
import { OrchestratorState } from "./state";

export const createOrchestratorAtom = () => new Atom<OrchestratorState>({
  manifest: {
    description: "None",
    fileName: "<init>",
    steps: [],
    assertions: [],
    children: [],
  },
  agents: {},
  testRuns: {},
});


export type Slice<T> = _Slice<T, OrchestratorState>
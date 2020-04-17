import { Atom as _Atom, Slice as _Slice } from "@bigtest/atom";
import { OrchestratorState } from "./state";

export const createOrchestratorAtom = () => new _Atom<OrchestratorState>({
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

export type Atom = _Atom<OrchestratorState>

export type Slice<T> = _Slice<T, OrchestratorState>
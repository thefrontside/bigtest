import { Atom as _Atom, Slice as _Slice } from "@bigtest/atom";
import { OrchestratorState } from "./state";

export class Atom extends _Atom<OrchestratorState> {
  initial = {
    manifest: {
      description: "None",
      fileName: "<init>",
      steps: [],
      assertions: [],
      children: [],
    },
    agents: {},
    testRuns: {},
  };
}

export type Slice<T> = _Slice<T, OrchestratorState>
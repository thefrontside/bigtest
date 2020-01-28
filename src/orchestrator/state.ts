import { view, set, over } from 'ramda';

export type AgentState = {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
    versionName: string;
  };
  platform: {
    type: string;
    vendor: string;
  };
  engine: {
    name: string;
    version: string;
  };
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
}

export class State {
  state: OrchestratorState = {
    agents: {}
  }

  get(): OrchestratorState {
    return this.state;
  }

  update(fn: (OrchestratorState) => OrchestratorState): void {
    this.state = fn(this.state);
  }

  view(lens) {
    return view(lens, this.get());
  }

  set(lens, value) {
    this.update((state) => set(lens, value, state) as unknown as OrchestratorState);
  }

  over(lens, fn) {
    this.update((state) => over(lens, fn, state) as unknown as OrchestratorState);
  }
}

import { Operation } from 'effection';
import { ResultStatus } from '@bigtest/suite';
import { Slice } from '@bigtest/atom';
import { OrchestratorState } from '../orchestrator/state';
import { ConnectionChannel } from '../connection-server';

export interface AggregatorOptions {
  agents: ConnectionChannel;
  testRunId: string;
}

export interface AggregatorAgentOptions extends AggregatorOptions {
  agentId: string;
}

export interface AggregatorTestOptions extends AggregatorAgentOptions {
  path: string[];
}

export abstract class Aggregator<T extends {status: unknown }, O extends AggregatorOptions> {
  constructor(
    public slice: Slice<T, OrchestratorState>,
    public options: O,
  ) {}

  get agents(): ConnectionChannel {
    return this.options.agents;
  }

  get statusSlice() {
    return this.slice.slice('status');
  }

  *perform(): Operation<ResultStatus> {
    throw new Error("override me in subclass");
  }

  *run() {
    try {
      return yield this.perform();
    } finally {
      if (this.statusSlice.get() === 'pending' || this.statusSlice.get() === 'running') {
        this.statusSlice.set('disregarded');
      }
    }
  }
}

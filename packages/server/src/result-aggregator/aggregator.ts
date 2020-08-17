import { Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { ResultStatus } from '@bigtest/suite';
import { Slice } from '@bigtest/atom';
import { AgentEvent } from '@bigtest/agent';
import { OrchestratorState } from '../orchestrator/state';

export interface AggregatorOptions {
  events: Mailbox<AgentEvent>;
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

  get events(): Mailbox<AgentEvent> {
    return this.options.events;
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

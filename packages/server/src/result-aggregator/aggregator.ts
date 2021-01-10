import { Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { ResultStatus } from '@bigtest/suite';
import { Slice } from '@bigtest/atom';
import { AgentEvent } from '@bigtest/agent';

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
    public slice: Slice<T>,
    public options: O,
  ) {}

  get events(): Mailbox<AgentEvent> {
    return this.options.events;
  }

  get statusSlice(): Slice<T["status"]> {
    return this.slice.slice('status');
  }

  *perform(): Operation<ResultStatus> {
    throw new Error("override me in subclass");
  }

  *run(): Generator<Operation<ResultStatus>> {
    try {
      return yield this.perform();
    } finally {
      if (this.statusSlice.get() === 'pending' || this.statusSlice.get() === 'running') {
        this.statusSlice.set('disregarded');
      }
    }
  }
}

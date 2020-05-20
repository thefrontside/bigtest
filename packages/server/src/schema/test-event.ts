// this just re-exports so it can be used from the schema
import { TestEvent as AgentTestEvent } from '@bigtest/agent';
import { ResultStatus } from '@bigtest/suite';

export interface TestRunResult {
  type: 'testRun:result';
  status: ResultStatus;
  testRunId: string;
}

export type TestEvent =
  TestRunResult |
  (AgentTestEvent & { agentId: string });

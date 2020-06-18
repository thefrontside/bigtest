// this just re-exports so it can be used from the schema
import { TestEvent as AgentTestEvent } from '@bigtest/agent';
import { ResultStatus } from '@bigtest/suite';

export interface TestRunResult {
  type: 'testRun:result';
  status: ResultStatus;
  testRunId: string;
}

export interface TestResult {
  type: 'test:result';
  status: ResultStatus;
  testRunId: string;
  agentId: string;
  path: string[];
}

export type TestEvent =
  TestRunResult |
  TestResult |
  (AgentTestEvent & { agentId: string });

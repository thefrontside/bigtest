import { LogEvent, ErrorDetails, ResultStatus } from '@bigtest/suite';

export type TestEventType = 'testRun' | 'agent' | 'test' | 'step' | 'assertion';

export interface TestEvent {
  testRunId: string;
  agentId?: string;
  type: TestEventType;
  status: ResultStatus;
  path?: string[];
  error?: ErrorDetails;
  timeout?: boolean;
  logEvents?: LogEvent[];
}

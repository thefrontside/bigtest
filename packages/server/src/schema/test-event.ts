// this just re-exports so it can be used from the schema
import { ResultStatus } from '@bigtest/suite';
import { AgentState } from '../orchestrator/state';

export interface TestEvent {
  type: string;
  status: ResultStatus;
  testRunId: string;
  agents: AgentState[];
  agent: AgentState;
  path: string[];
}

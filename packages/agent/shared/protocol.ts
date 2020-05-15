import { Operation } from 'effection';
import { Test, ResultStatus, ErrorDetails } from '@bigtest/suite';

export interface AgentProtocol {
  send(event: AgentEvent): void;
  receive(): Operation<Command>;
}

export interface Connect {
  type: 'connected';
  agentId?: string;
  data: unknown;
}

export interface RunBegin {
  type: 'run:begin';
  testRunId: string;
}

export interface RunEnd {
  type: 'run:end';
  testRunId: string;
}

export interface LaneBegin {
  type: 'lane:begin';
  testRunId: string;
  path: string[];
}

export interface LaneEnd {
  type: 'lane:end';
  testRunId: string;
  path: string[];
}

export interface TestRunning {
  type: 'test:running';
  testRunId: string;
  path: string[];
}

export interface StepRunning {
  type: 'step:running';
  testRunId: string;
  path: string[];
}

export interface StepResult {
  type: 'step:result';
  status: ResultStatus;
  testRunId: string;
  path: string[];
  error?: ErrorDetails;
  timeout?: boolean;
}

export interface AssertionRunning {
  type: 'assertion:running';
  testRunId: string;
  path: string[];
}

export interface AssertionResult {
  type: 'assertion:result';
  status: ResultStatus;
  testRunId: string;
  path: string[];
  error?: ErrorDetails;
}

export type AgentEvent = Connect | RunBegin | RunEnd | LaneBegin | LaneEnd | TestRunning | StepRunning | StepResult | AssertionRunning | AssertionResult;

export type Command = Run;

export interface Run {
  type: 'run';
  appUrl: string;
  manifestUrl: string;
  testRunId: string;
  tree: Test;
}

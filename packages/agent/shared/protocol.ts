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
  agentId?: string;
  testRunId: string;
}

export interface RunEnd {
  type: 'run:end';
  agentId?: string;
  testRunId: string;
}

export interface LaneBegin {
  type: 'lane:begin';
  agentId?: string;
  testRunId: string;
  path: string[];
}

export interface LaneEnd {
  type: 'lane:end';
  agentId?: string;
  testRunId: string;
  path: string[];
}

export interface TestRunning {
  type: 'test:running';
  agentId?: string;
  testRunId: string;
  path: string[];
}

export interface StepRunning {
  type: 'step:running';
  agentId?: string;
  testRunId: string;
  path: string[];
}

export interface StepResult {
  type: 'step:result';
  agentId?: string;
  status: ResultStatus;
  testRunId: string;
  path: string[];
  error?: ErrorDetails;
  timeout?: boolean;
}

export interface AssertionRunning {
  type: 'assertion:running';
  agentId?: string;
  testRunId: string;
  path: string[];
}

export interface AssertionResult {
  type: 'assertion:result';
  agentId?: string;
  status: ResultStatus;
  testRunId: string;
  path: string[];
  error?: ErrorDetails;
  timeout?: boolean;
}

export type TestEvent = RunBegin | RunEnd | LaneBegin | LaneEnd | TestRunning | StepRunning | StepResult | AssertionRunning | AssertionResult;

export type AgentEvent = Connect | TestEvent;

export type Command = Run;

export interface Run {
  type: 'run';
  appUrl: string;
  manifestUrl: string;
  testRunId: string;
  tree: Test;
  stepTimeout: number;
}

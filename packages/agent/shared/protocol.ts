import { Operation } from 'effection';
import { Test, ResultStatus, ErrorDetails } from '@bigtest/suite';

export interface AgentProtocol {
  send(event: AgentEvent): void;
  receive(): Operation<Command>;
}

interface Connect {
  type: 'connected';
  data: unknown;
}

interface RunBegin {
  type: 'run:begin';
  testRunId: string;
}

interface RunEnd {
  type: 'run:end';
  testRunId: string;
}

interface LaneBegin {
  type: 'lane:begin';
  testRunId: string;
  path: string[];
}

interface LaneEnd {
  type: 'lane:end';
  testRunId: string;
  path: string[];
}

interface TestRunning {
  type: 'test:running';
  testRunId: string;
  path: string[];
}

interface StepRunning {
  type: 'step:running';
  testRunId: string;
  path: string[];
}

interface StepResult {
  type: 'step:result';
  status: ResultStatus;
  testRunId: string;
  path: string[];
  error?: ErrorDetails;
}

interface AssertionRunning {
  type: 'assertion:running';
  testRunId: string;
  path: string[];
}

interface AssertionResult {
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

import { Test, TestResult, ResultStatus } from '@bigtest/suite';
import { BundlerError, BundlerWarning, ValidationWarning, ValidationError } from '@bigtest/bundler';
import { Operation } from 'effection';

export type AgentState = {
  agentId: string;
  browser?: {
    name: string;
    version: string;
  };
  os?: {
    name: string;
    version: string;
    versionName: string;
  };
  platform?: {
    type: string;
    vendor: string;
  };
  engine?: {
    name: string;
    version: string;
  };
}

export type TestRunState = {
  testRunId: string;
  status: ResultStatus;
  agents: Record<string, TestRunAgentState>;
}

export type TestRunAgentState = {
  status: ResultStatus;
  agent: AgentState;
  result: TestResult;
}

export type BundlerState =
  | { type: 'UNBUNDLED' }
  | { type: 'VALIDATING' }
  | { type: 'INVALID'; errors: ValidationError[]; warnings: ValidationWarning[] }
  | { type: 'VALID'; warnings: ValidationWarning[] }
  | { type: 'BUILDING'; warnings: BundlerWarning[] }
  | { type: 'GREEN'; path: string;  warnings: BundlerWarning[] }
  | { type: 'ERRORED'; error: BundlerError }

export type BundlerTypes = Pick<BundlerState, 'type'>['type'];

export interface Validator<R> {
  validate(files: string[]): Operation<R>;
}

export interface Manifest extends Test {
  fileName: string;
}

export type AppStatus = 'unstarted' | 'started' | 'reachable' | 'unreachable' | 'crashed'

export type AppOptions = {
  url: string;
  command?: string;
  env?: Record<string, string>;
  dir?: string;
}

export type AppServiceState = {
  appStatus: AppStatus;
  appOptions: AppOptions;
}

export type ProxyServiceState = {
  proxyStatus: 'unstarted' | 'starting' | 'started';
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: Manifest;
  bundler: BundlerState;
  testRuns: Record<string, TestRunState>;
  appService: AppServiceState;
  proxyService: ProxyServiceState;
}

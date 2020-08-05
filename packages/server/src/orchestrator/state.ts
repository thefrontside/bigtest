import { Test, TestResult, ResultStatus } from '@bigtest/suite';
import { BundlerError, BundlerWarning } from '@bigtest/bundler';

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

export type BundlerStatus = 'unbundled' | 'building' | 'errored' | 'green';

export type BundlerErrors = { errors: BundlerError[], warnings: BundlerWarning[] }

export type BundlerState = 
  | { status: 'unbundled' } 
  | { status: 'building' } 
  | { status: 'errored' } & BundlerErrors
  | { status: 'green' } & Pick<BundlerErrors, 'warnings'>

export interface Manifest extends Test {
  fileName: string;
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: Manifest;
  bundler: BundlerState;
  testRuns: Record<string, TestRunState>;
}
import { Test, TestResult, ResultStatus, ErrorDetails } from '@bigtest/suite';
import { BundlerState } from '@bigtest/bundler';

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
  error?: ErrorDetails;
}

export type TestRunAgentState = {
  status: ResultStatus;
  agent: AgentState;
  result: TestResult;
}

export interface Manifest extends Test {
  fileName: string;
}

export type AppStatus = 'unstarted' | 'started' | 'reachable' | 'unreachable' | 'crashed'

export type AppOptions = {
  url?: string;
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
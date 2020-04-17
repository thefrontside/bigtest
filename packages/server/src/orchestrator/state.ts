import { Test, TestResult } from '@bigtest/suite';

export type AgentState = {
  agentId: string;
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
    versionName: string;
  };
  platform: {
    type: string;
    vendor: string;
  };
  engine: {
    name: string;
    version: string;
  };
}

export type TestRunState = {
  testRunId: string;
  status: "pending" | "running" | "done";
  tree: TestResult;
  agent: AgentState;
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: Manifest;
  testRuns: Record<string, TestRunState>;
}

export interface Manifest extends Test {
  fileName: string;
}

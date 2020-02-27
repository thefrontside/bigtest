import { Test } from '@bigtest/suite';

export type AgentState = {
  identifier: string;
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

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: Manifest;
}

export interface Manifest extends Test {
  fileName: string;
}

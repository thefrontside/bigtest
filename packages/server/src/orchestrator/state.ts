import type { Test, TestResult, ResultStatus, ErrorDetails } from '@bigtest/suite';
import type { BundlerError, BundlerWarning } from '@bigtest/bundler';

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
  coverage?: unknown;
}

export type TestRunAgentState = {
  status: ResultStatus;
  agent: AgentState;
  result: TestResult;
  coverage?: unknown;
}

export type Key = string | number | symbol;

export type BundlerState =
  | { type: 'UNBUNDLED' }
  | { type: 'BUILDING'; warnings: BundlerWarning[] }
  | { type: 'GREEN'; path: string;  warnings: BundlerWarning[] }
  | { type: 'ERRORED'; error: BundlerError }

export type BundlerTypes = Pick<BundlerState, 'type'>['type'];

export interface Manifest extends Test  {
  fileName: string;
};

export type AppOptions = {
}

export type AppServerStatus =
  | {
      type: "pending";
    }
  | {
      type: "started";
    }
  | {
      type: "available";
    }
  | {
      type: "stopping";
    }
  | {
      type: "stopped";
    }
  | AppServerStatusExited;

export type AppServerStatusExited =
    {
      type: "exited";
      exitStatus: {
        code?: number;
        signal?: string;
        stderr: string;
        stdout: string;
      };
    };

export type ManifestGeneratorStatus = {
  type: "pending" | "ready";
};

export type ManifestServerStatus = {
  type: 'unstarted' | 'starting' | 'started';
}

export type ConnectionServerStatus = {
  type: 'unstarted' | 'starting' | 'started';
};

export type ProxyServerStatus = {
  type: 'unstarted' | 'starting' | 'started';
}

export type CommandServerStatus = {
  type: 'unstarted' | 'starting' | 'started';
}

export type OrchestratorStatus = {
  type: 'pending' | 'ready';
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: Manifest;
  testRuns: Record<string, TestRunState>;
  bundler: BundlerState;
  manifestGenerator: ManifestGeneratorStatus;
  manifestServer: ManifestServerStatus;
  appServer: AppServerStatus;
  proxyServer: ProxyServerStatus;
  connectionServer: ConnectionServerStatus;
  commandServer: CommandServerStatus;
  status: OrchestratorStatus;
}

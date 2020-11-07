import type { Test, TestResult, ResultStatus, ErrorDetails } from '@bigtest/suite';
import type { BundlerError, BundlerWarning } from '@bigtest/bundler';
import type { Slice } from '@bigtest/atom';
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

export type ServiceStatus = {
  type: string;
};

export type ServiceState<S extends ServiceStatus, O> = {
  options: O;
  status: S;
};

export type Service<S extends ServiceStatus, O> = {
  (state: Slice<ServiceState<S, O>, OrchestratorState>): Operation<void>;
};  

export interface Manifest extends Test  {
  fileName: string;
};

export type AppOptions = {
  url?: string;
  command?: string;
  env?: Record<string, string>;
  dir?: string;
}

export type AppServiceStatus =
  | {
      type: "pending";
    }
  | {
      type: "started";
    }
  | {
      type: "ready";
    }
  | {
      type: "stopping";
    }
  | {
      type: "stopped";
    }
  | {
      type: "exited";
      exitStatus: {
        code?: number;
        signal?: string;
        tail: string[];
        command: string;
      };
    };

export type ManifestGeneratorStatus = {
  type: "pending" | "ready";
};

export interface ManifestGeneratorOptions {
  files?: string[];
  mode: 'idle' | 'watch' | 'build';
  destinationPath?: string;
};

export type ProxyStatus = {
  type: 'unstarted' | 'starting' | 'started';
}

export type ProxyOptions = {
  port: number;
  harnessUrl: string;
  prefix?: string;
  appDir: string;
  appOptions: AppOptions;
};

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifestGenerator: ServiceState<ManifestGeneratorStatus, ManifestGeneratorOptions>;
  manifest: Manifest;
  bundler: BundlerState;
  testRuns: Record<string, TestRunState>;
  appService: ServiceState<AppServiceStatus, AppOptions>;
  proxyService: ServiceState<ProxyStatus, ProxyOptions>;
}

declare const o: OrchestratorState;
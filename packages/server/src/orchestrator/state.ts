import type { Test, TestResult, ResultStatus, ErrorDetails } from '@bigtest/suite';
import type { BundlerError, BundlerWarning } from '@bigtest/bundler';
import type { Operation } from 'effection';
import type { ExitStatus } from '@effection/node';
import type { Atom } from '@bigtest/atom';

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

export type ServiceStatus =
  | { type: 'unstarted' }
  | { type: 'started' }
  | { type: 'reachable' }
  | { type: 'exited'; exitStatus: ExitStatus };

export type ServiceStatuses = ServiceStatus['type'];

export type ServiceState<O> = {
  id: string;
  name: string;
  status: ServiceStatus;
  // TODO: we need to further constrain this to Slice(s)
  atom?: Atom<OrchestratorState>;
} & O;

export type Service<O> = {
  (options: Partial<Omit<ServiceState<O>, keyof O>> & O): Operation<void>;
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

export type AppServiceState = {
  appOptions: AppOptions;
};

export type ProxyServiceState = {
  proxyStatus: 'unstarted' | 'starting' | 'started';
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: Manifest;
  bundler: BundlerState;
  testRuns: Record<string, TestRunState>;
  appService: ServiceState<AppServiceState>;
  proxyService: ProxyServiceState;
}

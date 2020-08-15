import { RollupWarning, RollupError } from 'rollup';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

export type BundlerMessage =
  | { kind: 'START' }
  | { kind: 'UPDATE' }
  | { kind: 'WARN'; warning: BundlerWarning }
  | { kind: 'ERROR'; error: BundlerError }

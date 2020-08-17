import { RollupWarning, RollupError } from 'rollup';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

export type BundlerMessage =
  | { type: 'START' }
  | { type: 'UPDATE' }
  | { type: 'WARN'; warning: BundlerWarning }
  | { type: 'ERROR'; error: BundlerError }

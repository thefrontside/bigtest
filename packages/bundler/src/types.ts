import type { BundlerError, BundlerWarning } from '@bigtest/reporter';

export type BundlerMessage =
  | { type: 'START' }
  | { type: 'UPDATE' }
  | { type: 'WARN'; warning: BundlerWarning }
  | { type: 'ERROR'; error: BundlerError }

import { RollupWarning, RollupError } from 'rollup';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

export type BundlerState = 
  | { status: 'unbundled' } 
  | { status: 'building'; warnings: BundlerWarning[] } 
  | { status: 'green'; path: string;  warnings: BundlerWarning[] }
  | { status: 'end'; warnings: BundlerWarning[] }
  | { status: 'errored'; error: BundlerError }
  | { status: 'warn'; warnings: BundlerWarning[] }
  | { status: 'updated'; path: string };

import type { RollupWarning, RollupError } from 'rollup';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

export interface Std {
	write(...args: unknown[]): void;
}

export interface Out {
  out: Std;
  err: Std;
  setttings: OutOptions;
  debug(...args: unknown[]): void;
  error(error: string | Error | BundlerError): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  success(...args: unknown[]): void;
  clear(): void;
  
  silent?: boolean;
}

export type LogCategory = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface OutOptions {
  out: Std;
  err: Std;
  prefix?: string;
}

export type Nullable<T> = T extends NonNullable<T> ? never : T;

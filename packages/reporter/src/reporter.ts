import type { BundlerError, Out, LogCategory } from './types';

export class Reporter implements Pick<Out, LogCategory> {
  constructor(private out: Out) {}

  debug(...args: unknown[]) {
    this.out.debug(args);
  }

  info(...args: unknown[]) {
    this.out.info(args);
  }

  warn(...args: unknown[]) {
    this.out.warn(args);
  }

  success(...args: unknown[]) {
    this.out.success(args);
  }

  error(error: string | Error | BundlerError) {
    this.out.error(error);
  }

  clear() {
   this.out.clear(); 
  }
}
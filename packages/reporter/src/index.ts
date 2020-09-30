import { Reporter } from './reporter';
export type { BundlerError, BundlerWarning, Out, Std } from './types';
import { OutOptions } from './types';
import { ConsoleOut } from './out/console/console';

export { Reporter } from './reporter';

const DefaultOutOptions: OutOptions = {
  out: process.stdout,
  err: process.stderr
}

export const consoleReporter = (options: Partial<OutOptions>): Reporter => {
  let out = new ConsoleOut({ ...DefaultOutOptions, ...options });

  return new Reporter(out);
}
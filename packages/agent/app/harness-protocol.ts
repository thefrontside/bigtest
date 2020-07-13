import { ConsoleMessage } from '../shared/protocol';

export type HarnessMessage =
  { type: 'console'; message: ConsoleMessage };

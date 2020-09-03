import { ErrorDetails, ConsoleMessage } from '@bigtest/suite';

export type HarnessMessage =
  { type: 'console'; message: ConsoleMessage } |
  { type: 'error'; error: ErrorDetails };

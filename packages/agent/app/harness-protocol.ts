import { ErrorDetails } from '@bigtest/suite';
import { ConsoleMessage } from '../shared/protocol';

export type HarnessMessage =
  { type: 'console'; message: ConsoleMessage } |
  { type: 'error'; error: ErrorDetails };

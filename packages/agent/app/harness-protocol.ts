import { ErrorDetails, ConsoleMessage } from '@bigtest/suite';

export type HarnessMessage =
  { type: 'message'; occurredAt: string, message: ConsoleMessage } |
  { type: 'error'; occurredAt: string, error: ErrorDetails };

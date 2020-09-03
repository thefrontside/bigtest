import { ConsoleLevel, ConsoleMessage } from '@bigtest/suite';

type CallbackFn = (message: ConsoleMessage) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConsoleFn = (message?: any, ...optionalParams: any[]) => void

type Console = {
  log: ConsoleFn;
  info: ConsoleFn;
  debug: ConsoleFn;
  warn: ConsoleFn;
  error: ConsoleFn;
};

export function wrapConsole(callback: CallbackFn): Console {
  let originalConsole: Partial<Console> = {};

  for(let level of ['log', 'info', 'debug', 'warn', 'error'] as ConsoleLevel[]) {
    originalConsole[level] = console[level];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console[level] = (message?: any, ...optionalParams: any[]) => {
      callback({ level: level, text: [message, ...optionalParams].join(' ') });
      originalConsole[level]?.call(console, message, ...optionalParams);
    };
  }

  return originalConsole as Console;
}

export type Levels = "debug" | "info" | "warn" | "error";

const HIDDEN_LOGS = {
  debug: [],
  info: ["debug"],
  warn: ["debug", "log"],
  error: ["debug", "log", "warn"],
};

const { debug, log, warn, error } = console;

export function resetLogLevel(): void {
  console.debug = debug;
  console.log = log;
  console.warn = warn;
  console.error = error;
}

export function setLogLevel(level: Levels): void {
  resetLogLevel();
  HIDDEN_LOGS[level].forEach((level) => {
    console[level as Levels] = function() {
      // do nothing
    };
  });
}

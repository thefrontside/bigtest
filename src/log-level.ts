const HIDDEN_LOGS = {
  debug: [],
  info: ["debug"],
  warn: ["debug", "log"],
  error: ["debug", "log", "warn"],
}

const { debug, log, warn, error } = console;

export function reset() {
  console.debug = debug
  console.log = log
  console.warn = warn
  console.error = error
}

export function setLogLevel(level) {
  reset();
  HIDDEN_LOGS[level].forEach((level) => {
    console[level] = function() {
      // do nothing
    }
  });
}

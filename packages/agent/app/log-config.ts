import { LogEvent } from '@bigtest/suite';

/**
 * This is brute-force way of communicating between the test frame
 * and app frame. Because they are running on the same origin they can actually share
 * references to values which enables faster, and more realtime communication with
 * the server.
 */

export interface LogConfig {
  events: LogEvent[];
}

interface LogConfigurable {
  currentLogConfig?: LogConfig;
}

/**
 * Set information about the lane to run so that the test frame can retrieve it.
 * should only be called from the agent frame.
 */
export function setLogConfig(config: LogConfig): void {
  let context: typeof globalThis = window.window;
  let bigtest: LogConfigurable = context.__bigtest as LogConfigurable;
  if (!bigtest) {
    bigtest = context.__bigtest = {};
  }
  bigtest.currentLogConfig = config;
}


export function getLogConfig(): LogConfig | undefined {
  let context: typeof globalThis = window.window;
  let bigtest: LogConfigurable = context.__bigtest as LogConfigurable;
  return bigtest.currentLogConfig;
}



/**
 * Retrieve what to run for a lane. Should be called only from the test frame.
 */
export function getLogConfigFromAppFrame(): LogConfig | undefined {
  let bigtest: LogConfigurable = window.parent?.window.__bigtest as LogConfigurable;
  return bigtest?.currentLogConfig;
}

import { Run, TestEvent } from '../shared/protocol';
import { Channel } from '../node_modules/effection';

/**
 * This is brute-force way of communicating between the agent frame
 * and test frame. Because they are running on the same origin they can actually share
 * references to values which enables faster, and more realtime communication with
 * the server.
 */

export interface LaneConfig {
  command: Run;
  path: string[];
  events: Channel<TestEvent, undefined>;
}

interface LaneConfigurable {
  currentLaneConfig?: LaneConfig;
}

/**
 * Set information about the lane to run so that the test frame can retrieve it.
 * should only be called from the agent frame.
 */
export function setLaneConfigFromAgentFrame(config: LaneConfig): void {
  let context: typeof globalThis = window.window;
  let bigtest: LaneConfigurable = context.__bigtest as LaneConfigurable;
  if (!bigtest) {
    bigtest = context.__bigtest = {};
  }
  bigtest.currentLaneConfig = config;
}

/**
 * Retrieve what to run for a lane. Should be called only from the test frame.
 */
export function getLaneConfigFromTestFrame(): LaneConfig {
  let bigtest: LaneConfigurable = window.parent?.window.__bigtest as LaneConfigurable;

  if (!bigtest) {
    throw new Error(`CRITICAL: tried to get a lane configuration in order to run, but it does not exist.`)
  }
  if (!bigtest.currentLaneConfig) {
    throw new Error(`CRITICAL: tried to get a lane configuration in order to run, but it does not exist.`)
  }
  return bigtest.currentLaneConfig;
}

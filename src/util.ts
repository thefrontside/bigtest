import { fork, Execution } from 'effection';

const Fork = fork(function*() {}).constructor;

/**
 * When using effection, there is only one Execution that is
 * active at a time given the single threaded nature of
 * JavaScript. This retreives it.
 *
 * This is a total hack and should be added to the public
 * effection API
 */
export function getCurrentExecution(): Execution {
  return Fork["currentlyExecuting"] as Execution;
}

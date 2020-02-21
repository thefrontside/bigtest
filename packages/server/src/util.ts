import { Operation } from 'effection';

/**
 * Takes the common Node pattern of a callback with an error
 * parameter, and wraps it to return a yieldable Operation
 * instead.
 */
export function resumeOnCb(fn: (cb: (error?: Error) => void) => void): Operation {
  return (execution) => {
    let iCare = true;
    fn((error: Error) => {
      if (iCare) {
        if (error) {
          execution.fail(error);
        } else {
          execution.resume();
        }
      }
    });
    execution.ensure(() => { iCare = false });
  }
}

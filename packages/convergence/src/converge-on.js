/**
 * This is the internal mechanism for converging on assertions. You
 * should always use the `Convergence` class for creating convergences,
 * as this allows them to be chainable and reusable.
 *
 * This function captures a promise that will only resolve once a given
 * condition has been met. The condition will be tested once every
 * 10ms and is considered to be met when it does not error or return
 * false. If the assertion never passes within the timeout period,
 * then the promise will reject as soon as it can with the last error
 * it recieved while running the assertion.
 *
 * If `always` is true, then the promise will resolve only if the
 * condition has been met consistently over the entire timeout
 * period. And it will reject the first time it encounters an error.
 *
 * @private
 * @function convergeOn
 * @param {Function} assertion - Run to test condition repeatedly
 * @param {Number} [timeout=2000] - Milliseconds to check assertion
 * @param {Boolean} [always=false] - If true, the assertion must pass
 * throughout the entire timeout period
 * @returns {Promise} Resolves if the assertion passes at least once;
 * if `always` is true, then rejects at the first error instead
 */
export default function convergeOn(assertion, timeout = 2000, always = false) {
  let start = Date.now();
  let interval = 10;

  // track various stats
  let stats = {
    start,
    runs: 0,
    end: start,
    elapsed: 0,
    always,
    timeout,
    value: undefined
  };

  return new Promise((resolve, reject) => {
    (function loop() {
      // track stats
      stats.runs += 1;

      try {
        let results = assertion();

        // the timeout calculation comes after the assertion so that
        // the assertion's execution time is accounted for
        let doLoop = Date.now() - start < timeout;

        if (always && doLoop) {
          setTimeout(loop, interval);
        } else if (results === false) {
          throw new Error('convergent assertion returned `false`');
        } else if (!always && !doLoop) {
          throw new Error(
            'convergent assertion was successful, ' +
            `but exceeded the ${timeout}ms timeout`
          );
        } else {
          // calculate some stats right before resolving with them
          stats.end = Date.now();
          stats.elapsed = stats.end - start;
          stats.value = results;
          resolve(stats);
        }
      } catch (error) {
        let doLoop = Date.now() - start < timeout;

        if (!always && doLoop) {
          setTimeout(loop, interval);
        } else if (always || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

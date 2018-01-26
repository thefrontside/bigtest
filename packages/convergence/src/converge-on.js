/**
 * Capture a promise that will only resolve once a given condition
 * has been met. The condition will be tested once every 10ms and is
 * considered to be met when it does not error or return false. If the
 * assertion never passes, then the promise will reject right before
 * the timeout period with the last error it recieved while running
 * the assertion.
 *
 * If `always` is true, then the promise will resolve only if the
 * condition has been met consistently over the entire timeout
 * period. And it will reject the first time it encounters an
 * error.
 *
 * When `useStats` is true, the returned promise will resolve with a
 * stats object. This stats object holds various information about how
 * this convergent assertion ran.
 *
 * @param {Function} assertion - run to test condition repeatedly
 * @param {Number} [timeout=2000] - milliseconds to check assertion
 * @param {Boolean} [always] - if true, the assertion must pass
 * throughout the entire timeout period
 * @param {Boolean} [useStats] - if true, resolves with a stats object
 * @returns {Promise} resolves if the assertion passes at least once;
 * if `always` is true, then rejects at the first error instead
 */
export default function convergeOn(assertion, timeout = 2000, always, useStats) {
  let context = this;
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
      // sometimes it takes almost an entire interval before the promise
      // is actually rejected, so we need to stop looping before the
      // second from last interval.
      let doLoop = (Date.now() - start) + (interval * 2) < timeout;

      // track stats
      stats.runs += 1;

      try {
        let ret = assertion.call(context);

        if (always && doLoop) {
          setTimeout(loop, interval);
        } else if (ret === false) {
          throw new Error('convergent assertion returned `false`');
        } else {
          // calculate some stats right before resolving
          stats.end = Date.now();
          stats.elapsed = stats.end - start;
          stats.value = ret;

          // resolve with stats or the assertion return value
          resolve(useStats ? stats : ret);
        }
      } catch (error) {
        if (!always && doLoop) {
          setTimeout(loop, interval);
        } else if (always || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

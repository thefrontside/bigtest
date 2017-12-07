/**
 * Capture a promise that will only resolve once a given condition
 * has been met. The condition will be tested once every 10ms and is
 * considered to be met when it does not error or return false. If the
 * assertion never passes, then the promise will reject right before
 * the timeout period with the last error it recieved while running
 * the assertion.
 *
 * If `invert` is true, then the promise will resolve only if the
 * condition has been met consistently over the entire timeout
 * period. And it will reject the first time it encounters an
 * error.
 *
 * @param {Function} assertion - run to test condition repeatedly
 * @param {Number} [timeout=2000] - milliseconds to check assertion
 * @param {Boolean} [invert] - if true, the assertion must pass
 * throughout the entire timeout period
 * @returns {Promise} resolves if the assertion passes at least once;
 * if `invert` is true, then rejects at the first error instead
 */
export default function convergeOn(assertion, timeout = 2000, invert) {
  let context = this;
  let start = Date.now();
  let interval = 10;

  return new Promise((resolve, reject) => {
    (function loop() {
      let ellapsed = Date.now() - start;

      // sometimes it takes almost an entire interval before the promise
      // is actually rejected, so we need to stop looping before the
      // second from last interval.
      let doLoop = ellapsed + (interval * 2) < timeout;

      try {
        let ret = assertion.call(context);

        if (invert && doLoop) {
          setTimeout(loop, interval);
        } else if (ret === false) {
          throw new Error('convergent assertion returned `false`');
        } else {
          resolve(ret);
        }
      } catch(error) {
        if (!invert && doLoop) {
          setTimeout(loop, interval);
        } else if (invert || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

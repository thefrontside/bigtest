const { now } = Date;

/**
 * Captures a promise that will only resolve once a given condition
 * has been met. The condition will be tested once every 10ms and is
 * considered to be met when it does not error or return false.
 *
 * When `always` is false, the promise will resolve as soon as the
 * condition has been met. If it fails to do so within the timeout, it
 * will reject as soon as it can with the last error it received.
 *
 * When `always` is true, the promise will only resolve if the
 * condition is met consistently throughout the entire timeout
 * period. It will reject the first time it encounters an error.
 *
 * @private
 * @function convergeOn
 * @param {Function} assertion - Run to test condition repeatedly
 * @param {Number} timeout - Milliseconds to check assertion
 * @param {Boolean} always - If true, the assertion must pass
 * throughout the entire timeout period
 * @returns {Promise} Resolves if the assertion passes at least once;
 * if `always` is true, then rejects at the first error instead
 */
export function convergeOn(assertion, timeout, always) {
  let start = now();
  let interval = 10;
  let bail = false;

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

        // a promise means there could be side-effects; bail
        if (results && typeof results.then === 'function') {
          bail = true;

          throw new Error(
            'convergent assertion encountered a async function or promise; ' +
            'since convergent assertions can run multiple times, you should ' +
            'avoid introducing side-effects inside of them'
          );
        }

        // the timeout calculation comes after the assertion so that
        // the assertion's execution time is accounted for
        let doLoop = now() - start < timeout;

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
          stats.end = now();
          stats.elapsed = stats.end - start;
          stats.value = results;
          resolve(stats);
        }
      } catch (error) {
        let doLoop = now() - start < timeout;

        if (!bail && !always && doLoop) {
          setTimeout(loop, interval);
        } else if (bail || always || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

/**
 * Helper to make a function thannable which will invoke itself and
 * call `.then` on the results.
 *
 * @private
 * @param {Function} fn - Function to make thennable
 * @returns {Function} function with a then method
 */
function thennable(fn) {
  return Object.defineProperty(fn, 'then', {
    value: (...args) => fn().then(...args)
  });
}

/**
 * Converges on an assertion by resolving when the given assertion
 * passes _within_ the timeout period. The assertion will run once
 * every 10ms and is considered to be passing when it does not error
 * or return false. If the assertion never passes within the timeout
 * period, then the promise will reject as soon as it can with the
 * last error it recieved.
 *
 * ```javascript
 * // simple boolean test
 * await when(() => total === 100)
 *
 * // with chai assertions
 * await when(() => {
 *   expect(total).to.equal(100)
 *   expect(add(total, 1)).to.equal(101)
 * })
 * ```
 *
 * The `timeout` argument controls how long the assertion is given to
 * converge within. By default, this is `2000ms`.
 *
 * ```javascript
 * // will fail if `num` is not `1` within 100ms
 * await when(() => num === 1, 100)
 * ```
 *
 * Returns a thennable function that can be used as a callback where
 * libraries support async functions.
 *
 * ```javascript
 * // mocha's `it` supports async tests
 * it('becomes bar within one second', when(() => {
 *   expect(foo).to.equal('bar');
 * }, 1000));
 * ```
 *
 * @function when
 * @param {Function} assertion - Assertion to converge on
 * @param {Number} [timeout=2000] - Timeout in milliseconds
 * @returns {Function} thennable function that resolves when the
 * assertion converges
 */
export function when(assertion, timeout = 2000) {
  return thennable(() => convergeOn(assertion, timeout, false));
}

/**
 * Converges on an assertion by resolving when the given assertion
 * passes _throughout_ the timeout period. The assertion will run once
 * every 10ms and is considered to be passing when it does not error
 * or return false. If the assertion does not pass consistently
 * throughout the entire timeout period, it will reject the very first
 * time it encounters a failure.
 *
 * ```javascript
 * // simple boolean test
 * await always(() => total !== 100)
 *
 * // with chai assertions
 * await always(() => {
 *   expect(total).to.not.equal(100)
 *   expect(add(total, 1)).to.equal(101)
 * })
 * ```
 *
 * The `timeout` argument controls how long it will take for the
 * assertion to converge. By default, this is `200ms`.
 *
 * ```javascript
 * // will pass if `num` is less than `100` for 2 seconds
 * await always(() => num < 100, 2000)
 * ```
 *
 * Returns a thennable function that can be used as a callback where
 * libraries support async functions.
 *
 * ```javascript
 * // mocha's `it` supports async tests
 * it('stays foo for one second', always(() => {
 *   expect(foo).to.equal('foo');
 * }, 1000));
 * ```
 *
 * @function always
 * @param {Function} assertion - Assertion to converge with
 * @param {Number} [timeout=200] - Timeout in milliseconds
 * @returns {Function} thennable function that resolves when the
 * assertion converges
 */
export function always(assertion, timeout = 200) {
  return thennable(() => convergeOn(assertion, timeout, true));
}

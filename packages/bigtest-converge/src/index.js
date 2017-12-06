/**
 * Capture a promise that will only resolve once a give condition
 * has been met.
 *
 * Asynchrony. Blech! Amirite?!?
 *
 * I don't care (99.9% of the time) when something happens only that
 * it _does_ happen. That's where convergence comes in. We want to
 * declare the state that we expect to see, and then just wait and see
 * if that happens. convergeOn() continously checks to see if a
 * condition is met, and then lets you take some action when it
 * has. It does this by returning a Promise that resolves when the
 * condition passes.
 *
 * An assertion is considered to be passing if it does not throw any
 * errors and does not return `false`. After a given timeout, if the
 * `assertion` does _not_ pass, then it will give up and reject the
 * promise.
 *
 * By default, `convergeOn` checks that an assertion passes at least
 * once during the timeout window. Sometimes however, you want to
 * check the opposite: not that something has changed, but that
 * something remains constant. In that case you want to set `invert`
 * to true, and it will only resolve if the `assertion` is true for
 * the entire timeout period, not just once.
 *
 * If you're inverting your assertion, then you probably don't want to
 * wait for the entire test timeout period... maybe it's enough for
 * you to ensure that there are no changes for say, 500ms. In that
 * case, you'd want to pass an explicit timeout.
 *
 * @param {function} assertion - run to test condition repeatedly
 * @param {number} [timeout=2000] - milliseconds to check assertion
 * @param {boolean} [invert] - if true, makes sure assertion passes
 * throughout the entire tiemout period.
 * @returns {Promise} resolves if assertion passes at least once.
 */
export function convergeOn(assertion, timeout = 2000, invert) {
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
          throw new Error('the assertion returned `false`');
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

/**
 * Creates a convergent assertion function that when called will
 * return a promise that resolves once the assertion passes with
 * the given arguments.
 * @see convergeOn
 *
 * Example:
 *   let total = 0;
 *   let convergeOnTotal = convergent((num) => {
 *     assert.equal(total, num);
 *   }, 500);
 *
 *   // will resolve if `total` equals `5` within 500ms
 *   convergeOnTotal(5)
 *     .then(() => {
 *       console.log('assertion passed!')
 *     })
 *     .catch((e) => {
 *       console.log('assertion failed!');
 *       console.error(e);
 *     });
 *
 *   // commenting this line will cause the promise to be rejected
 *   setTimeout(() => total = 5, 400);
 *
 * Inverted example:
 *   let total = 5;
 *   let convergeWithTotal = convergent((num) => {
 *     assert.equal(total, num);
 *   }, 500, true); // <- invert=true
 *
 *   // will resolve if `total` remains `5` for at least 500ms
 *   convergeWithTotal(5)
 *     .then(() => {
 *       console.log('assertion passed!')
 *     })
 *     .catch((e) => {
 *       console.log('assertion failed!');
 *       console.error(e);
 *     });
 *
 *   // uncommenting this line will cause the promise to be rejected
 *   // setTimeout(() => total = 0, 400);
 */
export function convergent(assertion, timeout, invert) {
  let converge = function converge(...args) {
    return convergeOn.apply(this, [
      assertion.bind(this, ...args),
      converge.timeout,
      invert
    ]);
  };

  // allows modification of the timeout before execution
  converge.timeout = timeout;

  // flags this function as a convergent one
  converge.convergent = true;

  return converge;
}

/**
 * Convergent helper that ensures a set of convergent functions all
 * converge after one another within a timeout period. If a provided
 * function is not convergent, it is simply invoked with the previous
 * resolved value and its return value is passed to the next function
 * in the series.
 *
 * This function works by modifying the timeout period of convergent
 * functions created using the convergent helper above so that the
 * combined timeout period does not exceed a given value.
 *
 * Example:
 *   beforeEach(() => {
 *     return convergeSeries([
 *       convergent(() => {
 *         let $el = $(selector);
 *         expect($el).to.exist;
 *         return $el.get(0);
 *       }),
 *       (node) => {
 *         node.click();
 *       },
 *       convergent(() => {
 *         expect(sideEffect).to.be.true;
 *       });
 *     ]);
 *   });
 *
 * @param {[Function]} funcs - Array of possibly convergent functions
 * @param {Number} [timeout=2000] - Timeout that all functions must
 * converge within
 */
export function convergeSeries(funcs, timeout = 2000) {
  let start = Date.now();

  return funcs.reduce((promise, fn) => {
    let ellapsed = Date.now() - start;

    if (fn.convergent) {
      fn.timeout = timeout - ellapsed;
    }

    return promise.then(fn);
  }, Promise.resolve());
}

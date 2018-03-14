import Convergence from '@bigtest/convergence';

/**
 * Creates a convergent assertion using the current testing context's
 * timeout. The test's timeout is disabled to allow the convergence to
 * sometimes settle just after its own timeout.
 *
 * @param {Function} assertion - assertion to converge on
 * @param {Boolean} [always] - true when the assertion should always pass
  * @returns {Function} assertion to use with mocha's it
 */
export function convergent(assertion, always) {
  return function() {
    let assert = assertion.bind(this);
    let converge = new Convergence();
    let timeout = this.timeout();

    if (always) {
      converge = converge.always(assert);
    } else {
      converge = converge.once(assert);
    }

    // convergences have their own timeouts
    this.timeout(0);
    // run the convergence with the original timeout
    return converge.timeout(timeout).run();
  };
}

/**
 * Allows automatically running returned convergence instances.
 *
 * Convergences are not only useful for assertions, but also for
 * setting up your tests as well. For example, converging on the
 * existence of a button before clicking it. Mocha works with promises
 * out of the box, so you can use convergences by returning
 * `convergence.run()` in your mocha hooks. To time it properly, you'd
 * also have to call `convergence.timeout()` with the same timeout
 * used for the current mocha context, and then disable the current
 * hook timeout to allow the convergence to settle afterwards.
 *
 * This function allows us to wrap our hooks, automatically setting
 * the `timeout()`, disabling the hook timeout, and calling `run()` on
 * any returned convergence. This reduces the boilerplate needed when
 * using convergences with Mocha's hooks.
 *
 * @param {Function} fn - function that may return a Convergence interface
 * @returns {Function} a function able to run the returned object
 */
export function handleConvergence(fn) {
  return function() {
    let result = fn.apply(this, arguments);
    let timeout = this.timeout();

    if (Convergence.isConvergence(result)) {
      // convergences have their own timeout
      this.timeout(0);
      // run the convergence with the original timeout
      return result.timeout(timeout).run();
    } else {
      return result;
    }
  };
}

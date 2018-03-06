import Convergence from '@bigtest/convergence';

/**
 * Creates a convergent assertion using the current testing
 * context's timeout and latency or any options passed.
 *
 * @param {Function} assertion - assertion to converge on
 * @param {Boolean} [always] - true when the assertion should always pass
  * @returns {Function} assertion to use with mocha's it
 */
export function convergent(assertion, always) {
  return function() {
    let converge = new Convergence();
    let assert = assertion.bind(this);
    let timeout = this.timeout();
    let latency = this.latency();

    if (always) {
      converge = converge.always(assert);
    } else {
      converge = converge.once(assert);
    }

    // adjust the timeout to deal with latency
    this.timeout(timeout + latency);
    // run the convergence under the original timeout
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
 * used for the current mocha context.
 *
 * This function allows us to wrap our hooks and automatically set the
 * `timeout()` and call `run()` on any returned convergence. This
 * reduces the boilerplate needed when using convergences with
 * Mocha's hooks.
 *
 * @param {Function} fn - function that may return a Convergence interface
 * @returns {Function} a function able to run the returned object
 */
export function handleConvergence(fn) {
  return function() {
    let result = fn.apply(this, arguments);
    let timeout = this.timeout();
    let latency = this.latency();

    if (result && result instanceof Convergence) {
      // adjust the timeout to deal with latency
      this.timeout(timeout + latency);
      // run the convergence under the original timeout
      return result.timeout(timeout).run();
    } else {
      return result;
    }
  };
}

/**
 * Adds a latency option to an existing instance
 *
 * @param {Object} instance - instance to add latency option to
 * @returns {Object} the instance with additional latency method
 */
export function wrappedContext(instance) {
  // sets the default latency to the parent latency or an actual default
  if (typeof instance._latency === 'undefined') {
    instance._latency = (instance.parent && instance.parent._latency) || 100;
  }

  // adds latency option to the instance
  if (!instance.latency) {
    instance.latency = function(ms) {
      if (!arguments.length) {
        return this._latency;
      } else {
        this._latency = ms;
        return this;
      }
    };
  }

  // adds a forwarding latency option to the instance's context
  if (instance.ctx && !instance.ctx.latency) {
    instance.ctx.latency = function(ms) {
      if (!arguments.length) {
        return this.runnable().latency();
      } else {
        this.runnable().latency(ms);
        return this;
      }
    };
  }

  return instance;
}

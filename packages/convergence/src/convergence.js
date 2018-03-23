import {
  isConvergence,
  runAssertion,
  runExec
} from './utils';

/**
 * The convergence class. Creating a new Convergence instance allows
 * you to chain convergent assertions together and execute them all at
 * once within a single timeout period.
 *
 * When you initialize a Convergence instance, you can provide a
 * timeout that will determine the total allowed time for all
 * convergences in this instance's stack.
 *
 * A Convergence instance is similar to a Promise or Observable, in
 * that it's methods return new Convergence instances. This allows you
 * to split a convergence and start each of them separately using
 * their respecting `.run()` methods.
 *
 * The `.timeout()` method only returns a new Convergence when you
 * provide a new timeout. If you do not provide any arguments, it will
 * instead return the current set timeout of the convergence.
 *
 * The `.run()` method _does not_ return a new Convergence
 * instance. It returns a promise that resolves or rejects depending
 * on the success of the assertions used to construct it. The `.run()`
 * method actually starts the assertions, and since it returns a new
 * promise each time, you can call `.run()` multiple times on the same
 * convergence instance.
 *
 * See the documentation below for each individual method.
 *
 * Example:
 *   let first = new Convergence(100)
 *     .once(() => expect(foo).to.equal('bar'))
 *
 *   let second = first.timeout(200)
 *     .do(() => console.log('foo', foo))
 *     .always(() => expect(foo).to.equal('bar'))
 *
 * `first.run()` has 100ms to converge on it's assertion.
 *
 * `second.run()` will log `foo` once the first assertion converges
 * and continue to assert the second assertion until the 200ms timeout
 * period has expired.
 */
class Convergence {
  /**
   * @constructor
   * @param {Object|Number} options - internal options, or a timeout
   * @param {Convergence} [prev] - previous convergence to extend
   */
  constructor(options = {}, prev = {}) {
    // a timeout was given
    if (typeof options === 'number') {
      options = { _timeout: options };
    }

    let {
      _timeout = prev._timeout || 2000,
      _stack = []
    } = options;

    // merge with the previous stack, if given
    _stack = [...(prev._stack || []), ..._stack];

    Object.defineProperties(this, {
      _timeout: { value: _timeout },
      _stack: { value: _stack }
    });
  }

  /**
   * Creates a new convergence with the given timout; or if no timeout
   * is given, will return the current timeout for this
   * convergence. The new convergence's stack will be inherited
   * from this convergence instance
   *
   * @param {Number} [timeout] - a timeout to create a new convergence with
   * @returns {Number|Convergence} the current timeout or a new
   * convergence instance
   */
  timeout(timeout) {
    if (typeof timeout !== 'undefined') {
      return new this.constructor(timeout, this);
    } else {
      return this._timeout;
    }
  }

  /**
   * Creates a new convergence with the given assertion added to its
   * stack. The new convergence's initial stack will be inherited from
   * this convergence instance. The assertion given to `.once()` will
   * be converged on using the `convergeOn` helper, but it's timeout
   * will be managed by this convergence instance
   *
   * @param {Function} assert - the assertion to converge on
   * @returns {Convergence} a new convergence instance
   */
  once(assert) {
    return new this.constructor({
      _stack: [{ assert }]
    }, this);
  }

  /**
   * Similar to `.once()`, creates a new convergence with the given
   * assertion added to its stack. However, the assertion given to
   * `.always()` will be ran until it fails, or passes for its entire
   * timeout period. When an `.always()` is last in a stack, it will
   * use the remaining convergence time to ensure the assertion
   * continues to pass. The timeout is used when there are more
   * assertions later in the stack, in which case this assertion needs
   * to finish with enough time for other possible assertions to also
   * have a chance to run
   *
   * @param {Function} assert - the assertion to converge on
   * @param {Number} [timeout] - this assertions timeout unless
   * this assertion occurs at the end of the stack; defaults to 1/10
   * of the total timeout (minimum 20ms)
   * @returns {Convergence} a new convergence instance
   */
  always(assert, timeout) {
    return new this.constructor({
      _stack: [{
        always: true,
        timeout,
        assert
      }]
    }, this);
  }

  /**
   * Creates a new convergence with the given callback added to its
   * stack. The new convergence's initial stack will be inherited from
   * this convergence instance. When a running convergence instance
   * encounters a `.do()`, it will invoke the callback with the value
   * returned from the last function in the stack. The resulting
   * return value will also be provided to the following function in
   * the stack
   *
   * @param {Function} exec - the callback to execute during the convergence
   * @returns {Convergence} a new convergence instance
   */
  do(exec) {
    return new this.constructor({
      _stack: [{ exec }]
    }, this);
  }

  /**
   * Appends a convergence to this convergence's stack to allow
   * composing different convergences together
   *
   * @param {Convergence} convergence - a convergence instance
   * @returns {Convergence} a new convergence instance
   */
  append(convergence) {
    if (!isConvergence(convergence)) {
      throw new Error('.append() only works with convergence instances');
    }

    return new this.constructor({
      _stack: convergence._stack
    }, this);
  }

  /**
   * Returns a promise that will resolve once all convergences in the
   * stack have been met within this instance's timeout period. The
   * return value from previous functions in the stack will be given
   * to the following functions in the stack. The promise will be
   * resolved with a stats object indicating various information.
   * The promise will be rejected whenever any convergence in the
   * stack fail
   *
   * @returns {Promise} resolves when all convergences have been met;
   * immediately rejects when any of them fail
   */
  run() {
    let start = Date.now();

    let stats = {
      start,
      runs: 0,
      end: start,
      elapsed: 0,
      value: undefined,
      timeout: this._timeout,
      stack: []
    };

    // reduce to a single promise that runs each item in the stack
    return this._stack.reduce((promise, subject, i) => {
      let last = i === (this._stack.length - 1);

      return promise.then((ret) => {
        if (subject.assert) {
          return runAssertion(subject, ret, last, stats);
        } else if (subject.exec) {
          return runExec(subject, ret, last, stats);
        }
      });
    }, Promise.resolve())
      // always resolve with the stats object
      .then(() => stats);
  }

  /**
   * By being thennable we can enable the usage of async/await syntax
   * with convergences. This allows us to naturally chain convergences
   * without calling `.run()`.
   *
   * For example:
   *   async function clickElement(selector) {
   *     // will resolve when the element exists
   *     let node = await new Convergence().once(() => {
   *       let el = document.querySelector('.element');
   *       return !!el && el;
   *     });
   *
   *     $node.click();
   *   }
   *
   * @private
   * @returns {Promise}
   */
  then() {
    // resolve with the value of the last function in the stack
    let promise = this.run().then(({ value }) => value);
    // pass promise arguments onward
    return promise.then.apply(promise, arguments);
  }
}

// static `isConvergence` method
Convergence.isConvergence = isConvergence;

export default Convergence;

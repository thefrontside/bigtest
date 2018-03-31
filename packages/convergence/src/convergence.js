import {
  isConvergence,
  runAssertion,
  runCallback
} from './utils';

/**
 * ```
 * import Convergence from '@bigtest/convergence'
 * ```
 *
 * Convergences are powerful, immutable, reusable, and composable
 * assertions that allow you to know immediately when a desired state
 * is achieved.
 *
 * ``` javascript
 * setTimeout(() => foo = 'bar', 100)
 * await new Convergence().when(() => foo === 'bar')
 * console.log(foo) // => "bar"
 * ```
 *
 * By default, a convergence will converge before or after `2000ms`
 * depending on the type of assertions defined. This can be configured
 * by providing a timeout when initializing the convergence, or by
 * using the [`#timeout()`](#timeout) method.
 *
 * ``` javascript
 * new Convergence(100)
 * new Convergence().timeout(5000)
 * ```
 *
 * Using [`#when()`](#when), the assertions will run multiple times
 * until they pass. Similarly, [`#always()`](#always) ensures that
 * assertions keep passing for a period of time.
 *
 * ``` javascript
 * // converges when `foo` is equal to `'bar'` within 100ms
 * new Convergence(100).when(() => foo === 'bar')
 * // converges after `foo` is equal to `'bar'` for at least 100ms
 * new Convergence(100).always(() => foo === 'bar')
 * ```
 *
 * Convergences are immutable, and as such, it's methods return new
 * instances. This allows you to compose multiple convergences and
 * start each of them separately using their respective
 * [`#run()`](#run) methods.
 *
 * ``` javascript
 * let converge = new Convergence(300)
 * let convergeFoo = converge.when(() => foo === 'foo')
 * let convergeFooBar = convergeFoo.when(() => foo === 'bar')
 * let convergeFooBarBaz = convergeFooBar.when(() => foo === 'baz')
 *
 * setTimeout(() => foo = 'foo', 100)
 * setTimeout(() => foo = 'bar', 200)
 * setTimeout(() => foo = 'baz', 150)
 *
 * // resolves after 100ms
 * convergeFoo.run()
 * // resolves after 200ms
 * convergeFooBar.run()
 * // rejects after 300ms since it wasn't `baz` _after_ `bar`
 * convergeFooBarBaz.run()
 * ```
 *
 * Convergences are also thennable, which immediately invokes
 * [`#run()`](#run). This allows them to be able to be used anywhere
 * Promises can be used in most cases.
 *
 * ``` javascript
 * async function onceBarAlwaysBar() {
 *   await new Convergence()
 *     .when(() => foo === 'bar')
 *     .always(() => foo === 'bar')
 * }
 *
 * Promise.race([
 *   onceBarAlwaysBar(),
 *   new Convergence().when(() => foo === 'baz')
 * ])
 * ```
 */
class Convergence {
  /**
   * The constructor actually takes two params, `options` and
   * `previous`. Publicly, `options` is `timeout`, but internally, new
   * instances receive new `options` in addition to the `previous`
   * instance. This allows things that extend convergences to still be
   * immutable, but requires that they have deeper knowledge of the
   * internal API.
   *
   * @constructor
   * @param {Number} timeout - Initial convergence timeout
   */
  constructor(options = {}, previous = {}) {
    // a timeout was given
    if (typeof options === 'number') {
      options = { _timeout: options };
    }

    let {
      _timeout = previous._timeout || 2000,
      _stack = []
    } = options;

    // merge with the previous stack, if given
    _stack = [...(previous._stack || []), ..._stack];

    Object.defineProperties(this, {
      _timeout: { value: _timeout },
      _stack: { value: _stack }
    });
  }

  /**
   * Returns a new convergence instance with the given timeout,
   * inheriting the current instance's assertions. If no timeout is
   * given, returns the current timeout for this instance.
   *
   * ``` javascript
   * let quick = new Convergence(100)
   * let long = quick.timeout(5000)
   *
   * quick.timeout() // => 100
   * long.timeout() // => 5000
   * ```
   *
   * @param {Number} [timeout] - Timeout for the next convergence
   * @returns {Number|Convergence} The current instance timeout or
   * a new convergence instance
   */
  timeout(timeout) {
    if (typeof timeout !== 'undefined') {
      return new this.constructor(timeout, this);
    } else {
      return this._timeout;
    }
  }

  /**
   * Returns a new convergence instance with an additional assertion.
   * This assertion is run repeatedly until it passes within the
   * timeout. If the assertion does not pass within the timeout, the
   * convergence will fail.
   *
   * ``` javascript
   * // would converge when `foo` equals `'bar'`
   * let convergeFoo = new Convergence().when(() => foo === 'bar')
   *
   * // would converge when `foo` equals `'bar'` and then `'baz'`
   * let convergeFooBar = convergeFoo.when(() => foo === 'baz')
   * ```
   *
   * @param {Function} assertion - The assertion to converge on
   * @returns {Convergence} A new convergence instance
   */
  when(assertion) {
    return new this.constructor({
      _stack: [{ assertion }]
    }, this);
  }

  /**
   * Alias for [`#when()`
   *
   * @deprecated
   * @returns {Convergence} a new convergence instance
   */
  once() {
    console.warn('#once() has been deprecated in favor of #when()');
    return this.when(...arguments);
  }

  /**
   * Returns a new convergence instance with an additional assertion.
   * This assertion is run repeatedly to ensure it passes throughout
   * the timeout. If the assertion fails at any point during the
   * timeout, the convergence will fail.
   *
   * ``` javascript
   * // would converge after `foo` remains `'foo'` for at least 100ms
   * new Convergence(100).always(() => foo === 'foo')
   * ```
   *
   * When an always assertion is encountered at the end of a
   * convergence, it is given the remaining timeout of the current
   * running instance. When it is not at the end, the provided `timeout`
   * is used instead. It has a minimum of `20ms`, and defaults to
   * one-tenth of the total timeout if not provided.
   *
   * ``` javascript
   * let convergeFooThenBar = new Convergence(100)
   * // would continue after `foo` remains `'foo'` for at least 50ms
   *   .always(() => foo === 'foo', 50)
   * // then have 50ms remaining to converge on `foo` being `'bar'`
   *   .when(() => foo === 'bar')
   * ```
   *
   * @param {Function} assertion - The assertion to converge on
   * @param {Number} [timeout] - The timeout to use when not run at
   * then end of the convergence
   * @returns {Convergence} A new convergence instance
   */
  always(assertion, timeout) {
    return new this.constructor({
      _stack: [{
        always: true,
        assertion,
        timeout
      }]
    }, this);
  }

  /**
   * Returns a new convergence instance with a callback added to its
   * stack. When a running convergence instance encounters a callback,
   * it will be invoked with the value returned from the last function
   * in the stack. The resulting return value will also be provided to
   * the following function in the stack.
   *
   * ``` javascript
   * new Convergence()
   *   // continues after finding a random even number
   *   .when(() => {
   *     let n = Math.ceil(Math.random() * 100)
   *     return !(n % 2) && n
   *   })
   *   // logs the number and continues
   *   .do((even) => {
   *     console.log('random even number between 1 and 100', even)
   *     return even
   *   })
   *   // asserts that any number times an even number is even
   *   .always((even) => {
   *     let n = Math.ceil(Math.random() * 100)
   *     let rand = n * even
   *     return !(rand % 2) && rand
   *   }, 100)
   *   // after 100ms logs the new random even number
   *   .do((even) => {
   *     console.log('new random even number', even)
   *   })
   * ```
   *
   * When a promise is returned from a callback, the convergence will
   * wait for the promise to resolve before continuing.
   *
   * ``` javascript
   * new Convergence()
   *   .when(() => foo === 'bar')
   *   .do(() => doSomethingAsync())
   *   .do((baz) => console.log('resolved with', baz))
   * ```
   *
   * Returning other convergences from a callback is also
   * supported. The returned convergence will be run with the current
   * remaining timeout. This is useful when computing convergences
   * after converging on another state.
   *
   * ``` javascript
   * new Convergence()
   *   // continue when `num` is less than 100
   *   .when(() => num < 100)
   *   .do(() => {
   *     // if odd, wait until it is even
   *     if (num % 2) {
   *       return new Convergence()
   *         .when(() => !(num % 2) && num)
   *     } else {
   *       return num;
   *     }
   *   })
   * ```
   *
   * @param {Function} callback - The callback to execute
   * @returns {Convergence} A new convergence instance
   */
  do(callback) {
    return new this.constructor({
      _stack: [{ callback }]
    }, this);
  }

  /**
   * Appends another convergence's stack to this convergence's stack
   * to allow composing different convergences together.
   *
   * ``` javascript
   * // would converge when `foo` equals `'bar'`
   * let convergeBar = new Convergence().when(() => foo === 'bar')
   *
   * // would converge when `foo` equals `'baz'`
   * let convergeBaz = new Convergence().when(() => foo === 'baz')
   *
   * // would converge when `foo` equals `'bar'` and then `'baz'`
   * let convergeBarBaz = convergeBar.append(convergeBaz)
   * ```
   *
   * @param {Convergence} convergence - A convergence instance
   * @returns {Convergence} A new convergence instance
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
   * Runs the current convergence instance, returning a promise that
   * will resolve after all assertions have converged, or reject when
   * any of them fail.
   *
   * ``` javascript
   * let convergence = new Convergence().when(() => foo === 'bar');
   *
   * // will converge within the timeout or fail afterwards
   * convegence.timeout(100).run()
   *   .then(() => console.log('foo is bar!'))
   *   .catch(() => console.log('foo is not bar'))
   * ```
   *
   * When an assertion fails and the convergence rejects, it is
   * rejected with the last error thrown from the assertion.
   *
   * ``` javascript
   * let convergence = new Convergence().when(() => {
   *   expect(foo).to.equal('bar')
   * })
   *
   * // will fail after 100ms if `foo` does not equal `'bar'`
   * convegence.timeout(100).run()
   *   .catch((e) => console.error(e)) // expected '' to equal 'bar'
   * ```
   *
   * When the convergence is successful and the promise resolves, it
   * will resolve with a stats object containing useful information
   * about how the convergence and it's assertions ran.
   *
   * ``` javascript
   * let convergence = new Convergence()
   *   .when(() => foo === 'bar')
   *   .always(() => foo === 'bar')
   *
   * convergence.run().then((stats) => {
   *   stats.start   // timestamp of the convergence start time
   *   stats.end     // timestamp of the convergence end time
   *   stats.elapsed // amount of milliseconds the convergence took
   *   stats.timeout // the timeout this convergence used
   *   stats.runs    // total times this convergence ran an assertion
   *   stats.value   // last returned value from the stack
   *   stats.stack   // array of other stats for each assertion
   * })
   * ```
   *
   * @returns {Promise}
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
      // the last subject will receive the remaining timeout
      if (i === (this._stack.length - 1)) {
        subject = Object.assign({ last: true }, subject);
      }

      return promise.then((ret) => {
        if (subject.assertion) {
          return runAssertion.call(this, subject, ret, stats);
        } else if (subject.callback) {
          return runCallback.call(this, subject, ret, stats);
        }
      });
    }, Promise.resolve())
      // always resolve with the stats object
      .then(() => stats);
  }

  /**
   * By being thennable we can enable the usage of async/await syntax
   * with convergences. This allows us to naturally chain convergences
   * without calling `#run()`.
   *
   * ``` javascript
   * async function click(selector) {
   *   // will resolve when the element exists and gets clicked
   *   await new Convergence()
   *     .when(() => {
   *       let $node = document.querySelector('.element')
   *       return !!$node && $node
   *     })
   *     .do(($node) => {
   *       $node.click()
   *     })
   * }
   * ```
   *
   * The convergence thennable method immediately invokes `#run()` and
   * resolves with the last returned value from the convergence's
   * stack. This allows us to await for values from a convergence.
   *
   * ``` javascript
   * let find = (selector) => new Convergence().when(() => {
   *   let $node = document.querySelector('.element')
   *   return !!$node && $node
   * })
   *
   * async function fill(selector, value) {
   *   let $node = await find(selector)
   *   $node.value = value
   * }
   * ```
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

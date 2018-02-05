import * as mocha from './mocha';
import Convergence from '@bigtest/convergence';

/**
 * Creates a convergent assertion using the current testing
 * context's timeout.
 *
 * @param {Function} assertion - assertion to converge on
 * @param {Boolean} always - true when the assertion should always pass
 * @returns {Function} assertion to use with mocha's it
 */
function convergent(assertion, always) {
  return function() {
    let timeout = 2000;

    if (typeof this.timeout === 'function') {
      timeout = this.timeout();
    }

    let converge = new Convergence(timeout);
    let assert = assertion.bind(this);

    if (always) {
      return converge.always(assert).run();
    } else {
      return converge.once(assert).run();
    }
  };
}

/**
 * Allows automatically running returned objects that implement
 * a Convergence interface. A Convergence interface is an immutable
 * instance that supports both `.timeout` and `.run` methods.
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
 * `timeout()` and call `run()` on any returned convergence or
 * convergence-like object. This reduces the boilerplate needed when
 * using convergences with Mocha's hooks.
 *
 * @param {Function} fn - function that may return a Convergence interface
 * @returns {Function} a function able to run the returned object
 */
function handleRunnable(fn) {
  let isRunnable = (obj) => {
    return typeof obj.timeout === 'function' &&
      typeof obj.run === 'function';
  };

  return function() {
    let result = fn.apply(this, arguments);

    if (result && isRunnable(result)) {
      let timeout = 2000;

      if (typeof this.timeout === 'function') {
        timeout = this.timeout();
      }

      return result.timeout(timeout).run();
    } else {
      return result;
    }
  };
}

/**
 * Convergent it will use the convergent helper to keep testing the assertion
 * repeatedly until it passes or until the timeout is reached
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to converge on
 */
function it(title, assertion) {
  if (!assertion) return mocha.it.skip(title);
  return mocha.it(title, convergent(assertion));
}

/**
 * Convergent it that will inversely keep testing an assertion repeatedly until
 * it fails or until the timeout is reached
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to inversely converge on
 */
function itAlways(title, assertion) {
  if (!assertion) return mocha.it.skip(title);
  return mocha.it(title, convergent(assertion, true));
}

/**
 * Convergent it, but using mocha `.only`
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to converge on
 */
function itOnly(title, assertion) {
  if (!assertion) return mocha.it.skip(title);
  return mocha.it.only(title, convergent(assertion));
}

/**
 * Inverted convergent it, but using mocha `.only`
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to inversely converge on
 */
function itAlwaysOnly(title, assertion) {
  if (!assertion) return mocha.it.skip(title);
  return mocha.it.only(title, convergent(assertion, true));
}

/**
 * Pauses a test by setting the timeout to zero, and returning
 * a promise that never resolves
 *
 * @param {String} title - specification description
 */
function itPause(title) {
  return mocha.it(title, function() {
    return new Promise(() => {});
  }).timeout(0);
}

/**
 * Pauses a test, but using mocha `.only`
 *
 * @param {String} title - specification description
 */
function itPauseOnly(title) {
  return mocha.it.only(title, function() {
    return new Promise(() => {});
  }).timeout(0);
}

// attach everything to `it`
it.only = itOnly;
it.always = itAlways;
it.always.only = itAlwaysOnly;
it.only.always = itAlwaysOnly;
it.pause = itPause;
it.pause.only = itPauseOnly;
it.only.pause = itPauseOnly;

// alias mocha's it.skip
it.skip = mocha.it.skip;
it.always.skip = mocha.it.skip;

/**
 * Just like mocha's before, but with the ability to automatically
 * run Convergence-like instances.
 *
 * @param {Function} setup - setup function
 */
function before(setup) {
  return mocha.before(handleRunnable(setup));
}

/**
 * Just like mocha's beforeEach, but with the ability to automatically
 * run Convergence-like instances.
 *
 * @param {Function} setup - setup function
 */
function beforeEach(setup) {
  return mocha.beforeEach(handleRunnable(setup));
}

/**
 * Just like mocha's after, but with the ability to automatically
 * run Convergence-like instances.
 *
 * @param {Function} teardown - teardown function
 */
function after(teardown) {
  return mocha.after(handleRunnable(teardown));
}

/**
 * Just like mocha's afterEach, but with the ability to automatically
 * run Convergence-like instances.
 *
 * @param {Function} teardown - teardown function
 */
function afterEach(teardown) {
  return mocha.afterEach(handleRunnable(teardown));
}

// destructure this for exporting
let { describe } = mocha;

// export our convergent it, wrapped hooks, and their aliases
export {
  it,
  before,
  beforeEach,
  after,
  afterEach,
  describe,
  // TDD interface aliases
  it as test,
  describe as context,
  // BDD interface aliases
  it as specify,
  before as suiteSetup,
  beforeEach as setup,
  after as suiteTeardown,
  afterEach as teardown,
  describe as suite
};

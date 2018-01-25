import { it as mochaIt } from 'mocha';
import Convergence from '@bigtest/convergence';

/**
 * Helper to create a convergent assertion using the current testing
 * context's timeout.
 *
 * @param {Function} assertion - assertion to converge on
 * @param {Boolean} always - true when the assertion should always pass
 * @returns {Function} assertion to use with mocha's it
 */
function convergent (assertion, always) {
  return function () {
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
 * Convergent it will use the convergent helper to keep testing the assertion
 * repeatedly until it passes or until the timeout is reached
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to converge on
 */
function it (title, assertion) {
  if (!assertion) return mochaIt.skip(title);
  return mochaIt(title, convergent(assertion));
}

/**
 * Convergent it that will inversely keep testing an assertion reapeatedly until
 * it fails or until the timeout is reached
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to inversely converge on
 */
function itAlways (title, assertion) {
  if (!assertion) return mochaIt.skip(title);
  return mochaIt(title, convergent(assertion, true));
}

/**
 * Convergent it, but using mocha `.only`
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to converge on
 */
function itOnly (title, assertion) {
  if (!assertion) return mochaIt.skip(title);
  return mochaIt.only(title, convergent(assertion));
}

/**
 * Inverted convergent it, but using mocha `.only`
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to inversely converge on
 */
function itAlwaysOnly (title, assertion) {
  if (!assertion) return mochaIt.skip(title);
  return mochaIt.only(title, convergent(assertion, true));
}

/**
 * Pauses a test by setting the timeout to zero, and returning
 * a promise that never resolves
 *
 * @param {String} title - specification description
 */
function itPause (title) {
  return mochaIt(title, function () {
    return new Promise(() => {});
  }).timeout(0);
}

/**
 * Pauses a test, but using mocha `.only`
 *
 * @param {String} title - specification description
 */
function itPauseOnly (title) {
  return mochaIt.only(title, function () {
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
it.skip = mochaIt.skip;
it.always.skip = mochaIt.skip;

// in BDD interface `specify` is an alias for `it`
let specify = it;

// in TDD interface `test` is an alias for `it`
let test = it;

// export our convergent it (and aliases)
export { it, specify, test };

// export other mocha functions used for testing
export {
  describe,
  context,
  before,
  beforeEach,
  after,
  afterEach,
  // BDD interface functions
  suite,
  suiteSetup,
  setup,
  suiteTeardown,
  teardown
} from 'mocha';

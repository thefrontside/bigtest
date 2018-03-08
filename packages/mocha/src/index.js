import * as mocha from './mocha';
import { convergent, handleConvergence } from './utils';

/**
 * Creates a convergent it function. Accepts the original it as the
 * first argument and a boolean to indicate that this should be an
 * always convergence.
 *
 * @param {Function} it - original it function
 * @param {Boolean} always - true to use an always convergence
 * @returns {Function} convergent it function
 */
function convergentIt(it, always) {
  return (title, assertion) => {
    let test = it(title, assertion && convergent(assertion, always));
    // it.always has a default timeout of 100ms
    return always ? test.timeout(100) : test;
  };
}

/**
 * Creates a hook capable of auto-running returned convergences
 *
 * @param {Function} hook - original hook function
 * @returns {Function} new hook function
 */
function convergentHook(hook) {
  return (fn) => hook(handleConvergence(fn));
}

/**
 * Simple pause test helper that sets the current timeout to 0 and
 * returns a promise that never resolves or rejects
 *
 * @param {Function} it - original it function
 * @returns {Function} new it function that will pause the test
 */
function pauseTest(it) {
  return (title) => it(title, function() {
    this.timeout(0);
    return new Promise(() => {});
  });
}

// all variations of `it`
const it = convergentIt(mocha.it);
it.only = convergentIt(mocha.it.only);
it.always = convergentIt(mocha.it, true);
it.always.only = convergentIt(mocha.it.only, true);
it.only.always = it.always.only;
it.pause = pauseTest(mocha.it);
it.pause.only = pauseTest(mocha.it.only);
it.only.pause = it.pause.only;
it.skip = mocha.it.skip;
it.always.skip = mocha.it.skip;

// convergent hooks
const before = convergentHook(mocha.before);
const beforeEach = convergentHook(mocha.beforeEach);
const after = convergentHook(mocha.after);
const afterEach = convergentHook(mocha.afterEach);

// destructure describe for exporting
const { describe } = mocha;

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

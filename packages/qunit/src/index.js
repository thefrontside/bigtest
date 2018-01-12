import { test as qunitTest } from 'qunit';
import Convergence from '@bigtest/convergence';

/**
 * Helper to create a convergent assertion using the current testing
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
 * Convergent test will use the convergent helper to keep testing the assertion
 * repeatedly until it passes or until the timeout is reached
 *
 * @param {String} title - specification description
 * @param {Function} assertion - the assertion to converge on
 */
function test(title, assertion) {
  if (!assertion) return qunitTest.skip(title);
  return qunitTest(title, convergent(assertion));
}


// export our convergent test
export { test };

// export other qunit functions used for testing
export {
  module,
  beforeEach,
  afterEach
} from 'qunit';

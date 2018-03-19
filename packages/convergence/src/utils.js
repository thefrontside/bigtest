import convergeOn from './converge-on';

/**
 * Gets the elapsed time since a `start` time; throws if it exceeds
 * the allowed `max` timeout.
 *
 * @param {Number} start - start time
 * @param {Number} max - maximum elapsed time
 * @returns {Number} elapsed time since `start`
 * @throws {Error} if the elapsed time exceeds `max`
 */
function getElapsedSince(start, max) {
  let elapsed = Date.now() - start;

  // we shouldn't continue beyond the timeout
  if (elapsed >= max) {
    throw new Error(`convergence exceeded the ${max}ms timeout`);
  }

  return elapsed;
};

/**
 * Adds stats to the accumulator and returns `stats.value`
 *
 * @param {Object} accumulator - stats accumulator
 * @param {Object} stats - new stats to add
 * @returns {*} stats.value
 */
function collectStats(accumulator, stats) {
  accumulator.runs += stats.runs;
  accumulator.elapsed += stats.elapsed;
  accumulator.end = stats.end;
  accumulator.value = stats.value;
  accumulator.stack.push(stats);

  return stats.value;
}

/**
 * Returns `true` if the object has `_stack`, `timeout`, and `run`
 * properties of the correct type
 *
 * @param {Object} obj - a possible convergence object
 * @returns {Boolean}
 */
export function isConvergence(obj) {
  return !!obj && typeof obj === 'object' &&
    '_stack' in obj && Array.isArray(obj._stack) &&
    'timeout' in obj && typeof obj.timeout === 'function' &&
    'run' in obj && typeof obj.run === 'function';
}

/**
 * Runs a single assertion from a convergence stack with `arg` as the
 * assertion's argument. Adds convergence stats to the `stats` object.
 *
 * @param {Object} subject - convergence assertion stack item
 * @param {*} arg - passed as the assertion's argument
 * @param {Boolean} last - true if this assertion is last in the stack
 * @param {Object} stats - stats accumulator object
 * @returns {Promise} resolves with the assertion's return value
 */
export function runAssertion(subject, arg, last, stats) {
  let timeout = stats.timeout - getElapsedSince(stats.start, stats.timeout);
  let assertion = subject.assertion.bind(null, arg);

  // the last always uses the remaining timeout
  if (subject.always && !last) {
    // timeout needs to be smaller than the total timeout
    if (subject.timeout) {
      timeout = Math.min(timeout, subject.timeout);
      // default the timeout to one-tenth the total, or 20ms min
    } else {
      timeout = Math.max(stats.timeout / 10, 20);
    }
  }

  return convergeOn(assertion, timeout, subject.always)
  // incorporate stats and curry the assertion return value
    .then((convergeStats) => collectStats(stats, convergeStats));
}

/**
 * Runs a single function from a convergence stack with `arg` as the
 * function's argument. Adds simple stats to the `stats` object.
 *
 * When a promise is returned, the time it takes to resolve is
 * accounted for in `stats`.
 *
 * When a convergence is returned, it's own returned stats are
 * incorporated into the `stats` object, and it's final return value
 * is curried on.
 *
 * @param {Object} subject - convergence exec stack item
 * @param {*} arg - passed as the function's argument
 * @param {Boolean} last - true if this item is last in the stack
 * @param {Object} stats - stats accumulator object
 * @returns {Promise} resolves with the function's return value
 */
export function runCallback(subject, arg, last, stats) {
  let start = Date.now();
  let result = subject.callback(arg);

  let collectExecStats = (value) => {
    return collectStats(stats, {
      start,
      runs: 1,
      end: Date.now(),
      elapsed: getElapsedSince(start, stats.timeout),
      value
    });
  };

  // a convergence is called with the current remaining timeout
  if (isConvergence(result)) {
    let timeout = stats.timeout - getElapsedSince(start, stats.timeout);

    if (!last) {
      // this .do() just prevents the last .always() from
      // using the entire timeout
      result = result.do(ret => ret);
    }

    return result.timeout(timeout).run()
    // incorporate stats and curry the return value
      .then((convergeStats) => collectStats(stats, convergeStats));

  // a promise will need to settle first
  } else if (result && typeof result.then === 'function') {
    return result.then(collectExecStats);

  // any other result is just returned
  } else {
    return collectExecStats(result);
  }
}

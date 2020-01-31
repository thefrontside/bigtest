import { when, always } from './converge';

const { now } = Date;

/**
 * Gets the elapsed time since a `start` time; throws if it exceeds
 * the allowed `max` timeout.
 *
 * @private
 * @param {Number} start - Start time
 * @param {Number} max - Maximum elapsed time
 * @returns {Number} Elapsed time since `start`
 * @throws {Error} If the elapsed time exceeds `max`
 */
function getElapsedSince(start, max) {
  let elapsed = now() - start;

  // we shouldn't continue beyond the timeout
  if (elapsed >= max) {
    throw new Error(`convergence exceeded the ${max}ms timeout`);
  }

  return elapsed;
};

/**
 * Adds stats to the accumulator and returns `stats.value`. If
 * `stats.value` is undefined, `ret` is returned.
 *
 * @private
 * @param {Object} accumulator - Stats accumulator
 * @param {Object} stats - New stats to add
 * @param {*} ret - Return value when `stats.value` is undefined
 * @returns {*}
 */
function collectStats(accumulator, stats, ret) {
  accumulator.runs += stats.runs;
  accumulator.elapsed += stats.elapsed;
  accumulator.end = stats.end;
  accumulator.value = stats.value;
  accumulator.queue.push(stats);

  return typeof stats.value !== 'undefined'
    ? stats.value : ret;
}

/**
 * Returns `true` if the object has common convergence properties of
 * the correct type.
 *
 * ``` javascript
 * let result = maybeConvergence()
 *
 * if (isConvergence(result)) {
 *   await result.do(something).timeout(100)
 * } else {
 *   something(result)
 * }
 * ```
 *
 * @static
 * @alias Convergence.isConvergence
 * @param {Object} obj - A possible convergence object
 * @returns {Boolean}
 */
export function isConvergence(obj) {
  return !!obj && typeof obj === 'object' &&
    '_queue' in obj && Array.isArray(obj._queue) &&
    'timeout' in obj && typeof obj.timeout === 'function' &&
    'run' in obj && typeof obj.run === 'function';
}

/**
 * Runs a single assertion from a convergence queue with `arg` as the
 * assertion's argument. Adds convergence stats to the `stats` object.
 *
 * @private
 * @param {Object} subject - Convergence assertion queue item
 * @param {*} arg - Passed as the assertion's argument
 * @param {Object} stats - Stats accumulator object
 * @returns {Promise} Resolves with the assertion's return value
 */
export function runAssertion(subject, arg, stats) {
  let timeout = stats.timeout - getElapsedSince(stats.start, stats.timeout);
  let assertion = subject.assertion.bind(this, arg);
  let converge = subject.always ? always : when;

  // always defaults to one-tenth or the remaining timeout
  if (subject.always) {
    if (subject.timeout) {
      // ensure the timeout is shorter than the remaining
      timeout = Math.min(timeout, subject.timeout);
    } else if (!subject.last) {
      // default to one-tenth the total, minimum 20ms
      timeout = Math.max(stats.timeout / 10, 20);
    }
  }

  return converge(assertion, timeout)
  // incorporate stats and curry the assertion return value
    .then((convergeStats) => collectStats(stats, convergeStats, arg));
}

/**
 * Runs a single function from a convergence queue with `arg` as the
 * function's argument. Adds simple stats to the `stats` object.
 *
 * When a promise is returned, the time it takes to resolve is
 * accounted for in `stats`.
 *
 * When a convergence is returned, it's own returned stats are
 * incorporated into the `stats` object, and it's final return value
 * is curried on.
 *
 * @private
 * @param {Object} subject - Convergence exec queue item
 * @param {*} arg - Passed as the function's argument
 * @param {Object} stats - Stats accumulator object
 * @returns {Promise} Resolves with the function's return value
 */
export function runCallback(subject, arg, stats) {
  let start = now();
  let result = subject.callback.call(this, arg);

  let collectExecStats = value => {
    return collectStats(stats, {
      start,
      runs: 1,
      end: now(),
      elapsed: getElapsedSince(start, stats.timeout),
      value
    }, arg);
  };

  // a convergence is called with the current remaining timeout
  if (isConvergence(result)) {
    let timeout = stats.timeout - getElapsedSince(start, stats.timeout);

    if (!subject.last) {
      // this .do() just prevents the last .always() from
      // using the entire timeout
      result = result.do(ret => ret);
    }

    return result.timeout(timeout).run()
    // incorporate stats and curry the return value
      .then(convergeStats => collectStats(stats, convergeStats, arg));

  // a promise will need to settle first
  } else if (result && typeof result.then === 'function') {
    return result.then(collectExecStats);

  // any other result is just returned
  } else {
    return collectExecStats(result);
  }
}

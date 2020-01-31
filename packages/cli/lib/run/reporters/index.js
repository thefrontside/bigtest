import resolveLocal from '../util/resolve-local';
import BaseReporter from './base';

const { assign } = Object;

/**
 * Requires a local reporter's or module's default export and ensure's
 * it is an instance of the base reporter class.
 *
 * @private
 * @param {String} name - The local reporter name, or module path
 * @returns {Reporter} the resolved default reporter export
 * @throws {Error} when the reporter cannot be found, or if the default
 * export is not an instance of the base reporter class
 */
export function requireReporter(name) {
  let Reporter;

  if (typeof name === 'string') {
    let module = resolveLocal('reporter', name);
    Reporter = require(module).default;
  } else if (typeof name === 'function') {
    Reporter = name;
    name = Reporter.name;
  }

  if (!(Reporter && Reporter.prototype instanceof BaseReporter)) {
    throw new Error(`Invalid reporter "${name}"`);
  }

  return Reporter;
}

/**
 * Requires reporters and provides wrapper methods to invoke common
 * reporter methods.
 *
 * @private
 * @param {String[]} reporters - Reporters to require
 */
export default class ReporterManager {
  constructor(reporters, options = {}) {
    assign(this, {
      reporters: [].concat(reporters).map(module => {
        let Reporter = requireReporter(module);
        return new Reporter(options[Reporter.options]);
      })
    });
  }

  /**
   * Invokes the process method for all reporters
   *
   * @param {State} prev - The previous state instance
   * @param {State} next - The resulting state instance
   */
  process(prev, next) {
    for (let reporter of this.reporters) {
      reporter.process(prev, next);
    }
  }
}

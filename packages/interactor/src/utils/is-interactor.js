import { isConvergence } from '@bigtest/convergence';

/**
 * Returns `true` if the object has common interactor properties
 *
 * ``` javascript
 * let result = maybeInteractor()
 *
 * if (isInteractor(result)) {
 *   await result.login(user)
 * } else {
 *   something(result)
 * }
 * ```
 *
 * @static
 * @alias Interactor.isInteractor
 * @param {Object} obj - A possible interactor object
 * @returns {Boolean}
 */
export default function isInteractor(obj) {
  return isConvergence(obj) &&
    '$' in obj && typeof obj.$ === 'function' &&
    '$$' in obj && typeof obj.$$ === 'function' &&
    '$root' in obj;
}

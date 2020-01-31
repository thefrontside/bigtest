/**
 * Creates a property descriptor for interaction property getters.
 *
 * ``` javascript
 * function data(key, selector) {
 *   return computed(function() {
 *     return this.$(selector).dataset[key];
 *   })
 * }
 * ```
 *
 * ``` javascript
 * \@interactor class PageInteractor {
 *   username = data('user', '#user-info');
 * }
 * ```
 *
 * @function computed
 * @param {Function} getter - Property getter
 * @returns {Object} Property descriptor
 */
export function computed(getter) {
  return Object.assign({
    enumerable: false,
    configurable: false,
    get: getter
  });
}

/**
 * Creates a property descriptor for interaction methods.
 *
 * ``` javascript
 * function check(selector) {
 *   return action(function(name) {
 *     return this.click(`${selector}[name="${name}"]`);
 *   })
 * }
 * ```
 *
 * ``` javascript
 * \@interactor class CheckboxGroupInteractor {
 *   check = check('input[type="checkbox"]');
 * }
 * ```
 *
 * ``` javascript
 * new CheckboxGroupinteractor('.checkboxes').check('option-1');
 * ```
 *
 * @function action
 * @param {Function} method - Function body for the interaction method
 * @returns {Object} page-object property descriptor
 */
export function action(method) {
  return Object.assign({
    enumerable: false,
    configurable: false,
    value: method
  });
}

/**
 * Creates a property descriptor for page-object getter properties
 *
 * @param {Function} func - function used as the property getter
 * @returns {Object} page-object property descriptor
 */
export function computed(func) {
  return Object.assign({
    enumerable: false,
    configurable: false,
    get: func
  });
}

/**
 * Creates a property descriptor for interaction methods that also get
 * wrapped by a page-object method with the same name
 *
 * @param {Function} method - function body for the interaction method
 * @returns {Object} page-object property descriptor
 */
export function action(method) {
  return Object.assign({
    enumerable: false,
    configurable: false,
    value: method
  });
}

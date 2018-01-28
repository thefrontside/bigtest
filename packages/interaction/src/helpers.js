/**
 * Selects the first element using a selector via
 * `$scope.querySelector()`
 *
 * @param {String} selector - query selector string
 * @param {Element} [$scope=document] - optional scope that
 * supports `.querySelector()`
 */
export function $(selector, $ctx = document) {
  let $node = selector;

  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    $node = $ctx.querySelector(selector);
  }

  if (!$node) {
    throw new Error(`unable to select "${selector}"`);
  }

  return $node;
}

/**
 * Returns true if the provided object looks like a
 * property descriptor
 *
 * @param {Object} descr - maybe a property descriptor
 * @returns {Boolean} true if it looks like a descriptor
 */
export function isPropertyDescriptor(descr) {
  return descr &&
    (Object.hasOwnProperty.call(descr, 'get') ||
     Object.hasOwnProperty.call(descr, 'value')) &&
    Object.hasOwnProperty.call(descr, 'enumerable') &&
    Object.hasOwnProperty.call(descr, 'configurable');
}

/**
 * Creates a property descriptor that would satisfy the above, given
 * an additional `value` or `get` property
 *
 * @param {Object} descr - descriptor properties
 * @returns {Object} property descriptor
 */
export function createPropertyDescriptor(descr) {
  return Object.assign({
    enumerable: false,
    configurable: false
  }, descr);
}

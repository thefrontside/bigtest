/**
 * Selects the first element using a selector via
 * `$scope.querySelector()`
 *
 * @param {String} selector - query selector string
 * @param {Element} [$scope=document] - optional scope that
 * supports `.querySelector()`
 * @returns {Element} matching element node
 */
export function $(selector, $ctx = document) {
  let $node = selector;

  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    $node = $ctx.querySelector(selector);

  // if a non-string is falsy, return the context element
  } else if (!selector) {
    return $ctx;
  }

  if (!$node) {
    throw new Error(`unable to find "${selector}"`);
  }

  return $node;
}

/**
 * Selects all of the matching elements using a selector via
 * `$scope.querySelectorAll()`
 *
 * @param {String} selector - query selector string
 * @param {Element} [$scope=document] - optional scope that
 * supports `.querySelectorAll()`
 * @returns {Array} array of element nodes
 */
export function $$(selector, $ctx = document) {
  let nodes = [];

  if (!$ctx || typeof $ctx.querySelectorAll !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    nodes = [].slice.call($ctx.querySelectorAll(selector));
  }

  return nodes;
}

/**
 * Returns true if the provided object looks like a property
 * descriptor and have both `enumerable` and `configurable` properties
 * in addition to a `value` or `get` property.
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

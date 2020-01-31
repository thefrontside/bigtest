/**
 * Gets the first element matching a selector via `querySelector`.
 *
 * @private
 * @param {String} selector - Query selector string
 * @param {Element} [$ctx=document] - optional context that supports
 * the `querySelector` method
 * @returns {Element} Matching element
 */
export function $(selector, $ctx = document) {
  let $node = null;

  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    try {
      $node = $ctx.querySelector(selector);
    } catch (e) {
      throw new SyntaxError(`"${selector}" is not a valid selector`);
    }

  // if an element was given, return it
  } else if (selector instanceof Element) {
    return selector;

  // if the selector is falsy, return the context element
  } else if (!selector) {
    return $ctx;
  }

  if (!$node) {
    throw new Error(`unable to find "${selector}"`);
  }

  return $node;
}

/**
 * Gets all elements matching a selector via `querySelectorAll()`.
 *
 * @private
 * @param {String} selector - Query selector string
 * @param {Element} [$ctx=document] - optional context that supports
 * the `querySelectorAll` method
 * @returns {Array} Array of elements
 */
export function $$(selector, $ctx = document) {
  let nodes = [];

  if (!$ctx || typeof $ctx.querySelectorAll !== 'function') {
    throw new Error('unable to use the current context');
  }

  // given a string, use `querySelectorAll`
  if (typeof selector === 'string') {
    try {
      nodes = [].slice.call($ctx.querySelectorAll(selector));
    } catch (e) {
      throw new SyntaxError(`"${selector}" is not a valid selector`);
    }

  // given an iterable, assume it contains nodes
  } else if (Symbol.iterator in Object(selector)) {
    nodes = [].slice.call(selector);
  }

  // only return elements
  return nodes.filter($node => $node instanceof Element);
}

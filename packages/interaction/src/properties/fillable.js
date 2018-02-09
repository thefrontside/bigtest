/* global Event */
import { createPropertyDescriptor } from '../helpers';

/**
 * Adds a convergence for filling an input existing in the DOM. This
 * method works with one or two arguments. If given one argument, it
 * is used as the value to fill in the interaction's scoped
 * element. Given a second argument, the first is used a query
 * selector string to select an element for filling.
 *
 * Works around react by caching any custom value property descriptor
 * and reapplying it after an input event is dispatched on the node
 *
 * @param {String} selectorOrValue - query selector string or value if
 * the second argument is not provided
 * @param {String} [value] - if provided, the first argument is used
 * as the query selector string
 * @returns {Interaction}
 */
export function fill(selectorOrValue, value) {
  let selector;

  // if value is not defined, it is assumed that the only passed
  // argument is the value for the root element
  if (typeof value === 'undefined') {
    value = selectorOrValue;
  } else {
    selector = selectorOrValue;
  }

  return this.find(selector)
    .do(($node) => {
      // cache artificial value property descriptor
      let descriptor = Object.getOwnPropertyDescriptor($node, 'value');

      // remove artificial value property
      if (descriptor) delete $node.value;

      // set the actual value
      $node.value = value;

      // dispatch input event
      $node.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true
        })
      );

      // dispatch change event
      $node.dispatchEvent(
        new Event('change', {
          bubbles: true,
          cancelable: true
        })
      );

      // restore artificial value property descriptor
      if (descriptor) {
        Object.defineProperty($node, 'value', descriptor);
      }
    });
}

/**
 * Page-object property creator
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return createPropertyDescriptor({
    value(value) {
      return this.fill(selector, value);
    }
  });
}

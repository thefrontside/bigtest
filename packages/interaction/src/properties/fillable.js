/* global Event */
import { createPropertyDescriptor } from '../helpers';

/**
 * Adds a convergence for filling an input existing in the DOM
 *
 * Works around react by caching any custom value property descriptor
 * and reapplying it after an input event is dispatched on the node
 *
 * @param {String} selector - jQuery selector
 * @returns {Interaction}
 */
export function fill(selector, value) {
  return this.select(selector)
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

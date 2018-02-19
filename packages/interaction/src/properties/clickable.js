import { action } from './helpers';

/**
 * Adds a convergence for clicking an element existing in the DOM
 *
 * @param {String} selector - query selector
 * @returns {Interaction}
 */
export function click(selector) {
  return this.find(selector)
    .do(($node) => $node.click());
}

/**
 * Page-object property creator
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return action(function() {
    return this.click(selector);
  });
}

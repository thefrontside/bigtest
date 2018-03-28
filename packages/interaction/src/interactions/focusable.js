/* global Event */
import { action } from './helpers';

/**
 * Adds a convergence for focusing an element existing in the DOM
 *
 * @param {String} selector - query selector
 * @returns {Interaction}
 */
export function focus(selector) {
  return this.find(selector)
    .do(($node) => {
      $node.dispatchEvent(
        new Event('focus', {
          bubbles: true,
          cancelable: true
        })
      );
    });
}

/**
 * Page-object property creator
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return action(function() {
    return this.focus(selector);
  });
}

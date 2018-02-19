import { $$ } from '../helpers';
import { computed } from './helpers';

/**
 * Adds a convergence for finding elements in the DOM. If the elements
 * do not exist, an empty array is returned.
 *
 * @param {String} selector - query selector
 * @returns {Interaction}
 */
export function findAll(selector) {
  return this.once(() => {
    return $$(selector, this.$scope);
  });
}

/**
 * Page-object property creator
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return computed(function() {
    return $$(selector, this.$root);
  });
}

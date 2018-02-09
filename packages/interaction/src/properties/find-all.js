import { $$, createPropertyDescriptor } from '../helpers';

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
  return createPropertyDescriptor({
    get() {
      return $$(selector, this.$root);
    }
  });
}

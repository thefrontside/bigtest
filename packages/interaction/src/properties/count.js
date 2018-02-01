import { $$, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning the number of
 * elements found using a selector
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return createPropertyDescriptor({
    get() {
      return $$(selector, this.$root).length;
    }
  });
}

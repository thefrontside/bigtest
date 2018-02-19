import { $$ } from '../helpers';
import { computed } from './helpers';

/**
 * Page-object property creator for returning the number of
 * elements found using a selector
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return computed(function() {
    return $$(selector, this.$root).length;
  });
}

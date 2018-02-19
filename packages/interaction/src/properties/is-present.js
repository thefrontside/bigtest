import { $$ } from '../helpers';
import { computed } from './helpers';

/**
 * Page-object property creator for returning true or false depending
 * on if the element exists in the DOM.
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return computed(function() {
    return !!$$(selector, this.$root).length;
  });
}

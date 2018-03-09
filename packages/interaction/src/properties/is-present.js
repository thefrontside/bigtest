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
    try {
      // throws if the root element cannot be found
      return !!this.$$(selector).length;
    } catch (e) {
      return false;
    }
  });
}

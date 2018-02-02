import { $, elementMatches, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning true or false depending
 * on if the element matches the provided query selector
 *
 * @param {String} match - query selector
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(match, selector) {
  return createPropertyDescriptor({
    get() {
      return elementMatches($(selector, this.$root), match);
    }
  });
}

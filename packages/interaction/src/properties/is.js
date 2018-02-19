import { $, elementMatches } from '../helpers';
import { computed } from './helpers';

/**
 * Page-object property creator for returning true or false depending
 * on if the element matches the provided query selector
 *
 * @param {String} match - query selector
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(match, selector) {
  return computed(function() {
    return elementMatches($(selector, this.$root), match);
  });
}

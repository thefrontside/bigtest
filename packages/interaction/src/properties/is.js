import { $ } from '../helpers';
import { computed } from './helpers';

/**
 * IE compatible polyfill for Element.matches
 *
 * @param {Element} $el - DOM element
 * @param {String} selector - query selector string
 * @returns {Boolean}
 */
function elementMatches($el, selector) {
  if (!$el.matches) {
    return $el.msMatchesSelector(selector);
  } else {
    return $el.matches(selector);
  }
}

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

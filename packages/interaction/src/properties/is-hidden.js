import { computed } from './helpers';

/**
 * Page-object property creator for returning true or false depending
 * on if the element is hidden in the DOM.
 *
 * The element is considered hidden for HTML AREA elements, SVG
 * elements that do not render anything themselves, display:none
 * elements, and generally any elements that are not directly rendered
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return computed(function() {
    return !this.$(selector).getClientRects().length;
  });
}

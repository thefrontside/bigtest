import { computed } from './helpers';

/**
 * Page-object property creator for returning the innerText
 * of an element
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.$(selector).textContent
      .replace(/[\n\r]+|\s{2,}/, ' ').trim();
  });
}

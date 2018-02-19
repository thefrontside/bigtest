import { $, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning the innerText
 * of an element
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return createPropertyDescriptor({
    get() {
      return $(selector, this.$root).textContent
        .replace(/[\n\r]+|\s{2,}/, ' ').trim();
    }
  });
}

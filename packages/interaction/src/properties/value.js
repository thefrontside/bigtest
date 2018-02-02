import { $, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning the value
 * of an element
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return createPropertyDescriptor({
    get() {
      return $(selector, this.$root).value;
    }
  });
}

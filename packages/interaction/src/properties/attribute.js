import { $, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning an attribute
 * of an element
 *
 * @param {String} attr - attribute name
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(attr, selector) {
  return createPropertyDescriptor({
    get() {
      return $(selector, this.$root).getAttribute(attr);
    }
  });
}

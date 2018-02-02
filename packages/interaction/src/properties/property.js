import { $, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning a property
 * of an element
 *
 * @param {String} prop - property name
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(prop, selector) {
  return createPropertyDescriptor({
    get() {
      return $(selector, this.$root)[prop];
    }
  });
}

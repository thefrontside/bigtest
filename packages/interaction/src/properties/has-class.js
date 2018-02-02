import { $, createPropertyDescriptor } from '../helpers';

/**
 * Page-object property creator for returning true or false if the
 * element's classList contains the specified class
 *
 * @param {String} className - class name to check
 * @param {String} selector - query selector string
 * @returns {Object} property descriptor
 */
export default function(className, selector) {
  return createPropertyDescriptor({
    get() {
      return $(selector, this.$root).classList.contains(className);
    }
  });
}

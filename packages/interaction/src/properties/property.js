import { $ } from '../helpers';
import { computed } from './helpers';

/**
 * Page-object property creator for returning a property
 * of an element
 *
 * @param {String} prop - property name
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(prop, selector) {
  return computed(function() {
    return $(selector, this.$root)[prop];
  });
}

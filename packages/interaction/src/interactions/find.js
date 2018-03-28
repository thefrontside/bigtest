import { $ } from '../utils';
import { computed } from './helpers';

/**
 * Adds a convergence for an element existing in the DOM
 *
 * @param {String} selector - query selector
 * @returns {Interaction}
 */
export function find(selector) {
  return this.once(() => {
    return $(selector, this.$scope);
  });
}

/**
 * Page-object property creator
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.$(selector);
  });
}

import { computed } from './helpers';

/**
 * Converges on an element existing in the DOM.
 *
 * ``` javascript
 * let $el = await new Interactor().find('.some-element')
 * ```
 *
 * @method find
 * @memberOf Interactor
 * @param {String} selector - Element query selector
 * @returns {Interactor} A new instance with additional convergences
 */
export function find(selector) {
  return this.when(() => {
    return this.$(selector);
  });
}

/**
 * Interaction creator for finding a specific element within a custom
 * interactor class.
 *
 * ``` javascript
 * @interactor class PageInteractor {
 *   getHeading = find('h1.heading')
 * }
 * ```
 *
 * ``` javascript
 * let $heading = await new Interactor().getHeading()
 * ```
 *
 * @function find
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.$(selector);
  });
}

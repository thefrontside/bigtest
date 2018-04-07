import { computed } from './helpers';

/**
 * Returns `true` when the interactor scope exists in the DOM,
 * otherwise returns `false`.
 *
 * ``` html
 * <div id="foo">
 *   ...
 * </div>
 * ```
 *
 * ``` javascript
 * new Interactor('#foo').isPresent //=> true
 * new Interactor('#bar').isPresent //=> false
 * ```
 *
 * @member {Boolean} isPresent
 * @memberOf Interactor
 */
export function isPresent() {
  try {
    // throws when the scope cannot be found
    return !!this.$root;
  } catch (e) {
    return false;
  }
}

/**
 * Interaction creator for returning `true` or `false` within a custom
 * interactor class if the element exists in the DOM or not.
 *
 * ``` html
 * <div id="foo">
 *   ...
 * </div>
 * ```
 *
 * ``` javascript
 * @interactor class PageInteractor {
 *   isFooPresent = isPresent('#foo')
 *   isBarPresent = isPresent('#bar')
 * }
 * ```
 *
 * ``` javascript
 * new PageInteractor().isFooPresent // => true
 * new PageInteractor().isBarPresent // => false
 * ```
 *
 * @function isPresent
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.isPresent && !!this.$$(selector).length;
  });
}

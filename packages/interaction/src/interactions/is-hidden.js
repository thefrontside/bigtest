import { computed } from './helpers';

/**
 * Returns `true` when the interactor scope is visually hidden,
 * otherwise returns `false`. When the interactor scope cannot be
 * found, an error will be thrown.
 *
 * ``` html
 * <div id="foo">
 *   ...
 * </div>
 * <div id="bar" style="display: none">
 *   ...
 * </div>
 * ```
 *
 * ``` javascript
 * new Interactor('#foo').isHidden //=> false
 * new Interactor('#bar').isHidden //=> true
 * ```
 *
 * The element is considered NOT visible for HTML `<area>` elements,
 * SVG elements that do not render anything themselves, `display:
 * none` elements, and generally any elements that are not rendered.
 *
 * @member {Boolean} isHidden
 * @memberOf Interactor
 * @throws {Error} When the interactor scope cannot be found
 */
export function isHidden() {
  return !this.$root.getClientRects().length;
}

/**
 * Property creator for returning `true` or `false` within a custom
 * interactor class when a specific element is visually hidden or not.
 *
 * ``` html
 * <div id="foo">
 *   ...
 * </div>
 * <div id="bar" style="display: none">
 *   ...
 * </div>
 * ```
 *
 * ``` javascript
 * @interactor class PageInteractor {
 *   isFooHidden = isHidden('#foo')
 *   isBarHidden = isHidden('#bar')
 * }
 * ```
 *
 * ``` javascript
 * new PageInteractor().isFooHidden // => false
 * new PageInteractor().isBarHidden // => true
 * ```
 *
 * The element is considered NOT visible for HTML `<area>` elements,
 * SVG elements that do not render anything themselves, `display:
 * none` elements, and generally any elements that are not rendered.
 *
 * @function isHidden
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return !this.$(selector).getClientRects().length;
  });
}

import { computed } from './helpers';

/**
 * Returns `true` when the interactor scope is NOT visually hidden,
 * otherwise returns `false`. When the interactor scope cannot be
 * found, an error will be thrown.
 *
 * ``` html
 * <div id="foo">
 *   ...
 * </div>
 *
 * <div id="bar" style="display: none">
 *   ...
 * </div>
 * ```
 *
 * ``` javascript
 * new Interactor('#foo').isVisible //=> true
 * new Interactor('#bar').isVisible //=> false
 * ```
 *
 * The element is considered NOT visible for HTML `<area>` elements,
 * SVG elements that do not render anything themselves, `display:
 * none` elements, and generally any elements that are not rendered.
 *
 * @member {Boolean} Interactor#isVisible
 * @throws {Error} When the interactor scope cannot be found
 */
export function isVisible() {
  return !!this.$root.getClientRects().length;
}

/**
 * Property creator for returning `true` or `false` within a custom
 * interactor class depending on if the element is visible in the DOM.
 *
 * ``` html
 * <div id="foo">
 *   ...
 * </div>
 *
 * <div id="bar" style="display: none">
 *   ...
 * </div>
 * ```
 *
 * ``` javascript
 * \@interactor class PageInteractor {
 *   isFooVisible = isVisible('#foo');
 *   isBarVisible = isVisible('#bar');
 * }
 * ```
 *
 * ``` javascript
 * new PageInteractor().isFooVisible // => true
 * new PageInteractor().isBarVisible // => false
 * ```
 *
 * The element is considered NOT visible for HTML `<area>` elements,
 * SVG elements that do not render anything themselves, `display:
 * none` elements, and generally any elements that are not rendered.
 *
 * @function isVisible
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return !!this.$(selector).getClientRects().length;
  });
}

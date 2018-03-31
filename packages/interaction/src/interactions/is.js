import { computed } from './helpers';

/**
 * IE compatible polyfill for `Element.matches`
 *
 * @private
 * @param {Element} $el - DOM element
 * @param {String} selector - Query selector string
 * @returns {Boolean}
 */
function elementMatches($el, selector) {
  if (!$el.matches) {
    return $el.msMatchesSelector(selector);
  } else {
    return $el.matches(selector);
  }
}

/**
 * Property creator for returning `true` or `false` within a custom
 * interactor class depending on if the element matches the provided
 * query selector.
 *
 * ``` html
 * <ul class="list">
 *   <li id="foo">...</li>
 *   <li id="bar">...</li>
 *   <li id="baz">...</li>
 * </ul>
 * ```
 *
 * ``` javascript
 * @interactor class ListInteractor {
 *   isList = is('.list')
 *   isFooFirst = is('#foo', ':first-child')
 *   isBarLast = is('#bar', ':last-child')
 * }
 * ```
 *
 * ``` javascript
 * new ListInteractor('ul').isList //=> true
 * new ListInteractor('ul').isFooFirst //=> true
 * new ListInteractor('ul').isBarLast //=> false
 * ```
 *
 * @function is
 * @param {String} [selector] - Nested element query selector
 * @param {String} match - Matching query selector
 * @returns {Object} Property descriptor
 */
export default function(selector, match) {
  return computed(function() {
    return elementMatches(this.$(selector), match);
  });
}

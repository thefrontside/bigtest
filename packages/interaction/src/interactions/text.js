import { computed } from './helpers';

/**
 * Returns an element's text content after trimming any whitespace.
 *
 * The `innerText` property is not used because its content can be
 * effected by an element's psudo elements and styles (capitalization,
 * for example). The `textContent` property, however, is not; but the
 * content returned includes extra whitespace that the DOM would
 * otherwise trim (unless `whitespace: nowrap` is used).
 *
 * @private
 * @param {Element} $el - DOM element
 * @returns {String}
 */
function getText($el) {
  return $el.textContent
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Returns the trimmed `textContent` property of an element.
 *
 * ``` html
 * <p>
 *   Hello World!
 * </p>
 * ```
 *
 * ``` javascript
 * new Interactor('p').text //=> "Hello World!"
 * ```
 *
 * @member {Boolean} text
 * @memberOf Interactor
 * @throws {Error} When the interactor scope cannot be found
 */
export function text() {
  return getText(this.$root);
}

/**
 * Property creator for returning the trimmed `textContent` property
 * of an element within a custom interactor class.
 *
 * ``` html
 * <h1>
 *   Hello World!
 * </h1>
 * ```
 *
 * ``` javascript
 * @interactor class PageInteractor {
 *   heading = text('h1')
 * }
 * ```
 *
 * ``` javascript
 * new PageInteractor().heading //=> "Hello World!"
 * ```
 *
 * @function text
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return getText(this.$(selector));
  });
}

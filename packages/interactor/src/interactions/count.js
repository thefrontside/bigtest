import { computed } from './helpers';

/**
 * Property creator for returning the number of elements found via a
 * query selector. Will throw an error if the interactor scope cannot
 * be found.
 *
 * ``` html
 * <ul >
 *   <li>...</li>
 *   <li>...</li>
 *   <li>...</li>
 * </ul>
 * ```
 *
 * ``` javascript
 * \@interactor class ListInteractor {
 *   size = count('li');
 * }
 * ```
 *
 * ``` javascript
 * new ListInteractor('ul').size //=> 3
 * ```
 *
 * @function count
 * @param {String} selector - Element query selector
 * @throws {Error} When the interactor scope cannot be found
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.$$(selector).length;
  });
}

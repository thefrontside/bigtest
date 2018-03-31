import { computed } from './helpers';

/**
 * Converges on the scope existing in DOM, then returns an instance of
 * this interactor which will converge with an array of elements
 * matching the provided selector.
 *
 * ``` javascript
 * let $listItems = await new Interactor('ul').findAll('li')
 * ```
 *
 * @method findAll
 * @memberOf Interactor
 * @param {String} selector - Element query selector
 * @returns {Interactor} A new instance with additional convergences
 */
export function findAll(selector) {
  return this.when(() => {
    return this.$$(selector);
  });
}

/**
 * Interaction creator for finding a specific set of elements within a
 * custom interactor class.
 *
 * ``` javascript
 * @interactor class ListInteractor {
 *   getItems = findAll('li')
 * }
 * ```
 *
 * ``` javascript
 * let $listItems = await new ListInteractor('ul').getItems()
 * ```
 *
 * @function findAll
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.$$(selector);
  });
}

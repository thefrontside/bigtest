import Interactor from '../interactor';
import interactor from '../decorator';

/**
 * Interaction creator for a collection of nested interactors. A
 * collection interaction takes an index as it's argument and returns
 * an interactor scoped to that element.
 *
 * ``` html
 * <ul class="checkboxes">
 *   <li><input type="checkbox" .../></li>
 *   <li><input type="checkbox" .../></li>
 *   <li><input type="checkbox" .../></li>
 * </ul>
 * ```

 * ``` javascript
 * @interactor class CheckboxGroupInteractor {
 *   items = collection('input[type="checkbox"]')
 * }
 * ```
 *
 * Nested interactions return instances of the topmost interactor so
 * that the initial chain is never broken.
 *
 * ``` javascript
 * await checkboxGroup
 *   .item(0).click()
 *   .item(1).click()
 * ```
 *
 * When calling a collection method without an index, an array of
 * interactors are returned, each corresponding to an element in the
 * DOM at the time the method was invoked.
 *
 * ``` javascript
  * checkboxGroup.items().length // => 3
 *
 * // checks all checkboxes
 * await checkboxGroup.do(function() {
 *   return this.items().reduce((group, item) => {
 *     return group.append(item.click())
 *   }, this)
 * })
 * ```
 *
 * With the second argument, you can define additional interactions
 * using the various interaction helpers.
 *
 * ``` html
 * <ul class="cards">
 *   <li class="card">
 *     ...
 *     <a class="card-link" ...>
 *       ...
 *     </a>
 *   </li>
 * </ul>
 * ```
 *
 * ``` javascript
 * @interactor class CardsListInteractor {
 *   cards = collection('.card', {
 *     clickThrough: clickable('.card-link')
 *   })
 * }
 * ```
 *
 * You can also use another interactor class.
 *
 * ``` javascript
 * @interactor class CardInteractor {
 *   clickThrough = clickable('.card-link')
 * }
 *
 * @interactor class CardsListInteractor {
 *   cards = collection('.card', CardInteractor)
 * }
 * ```
 *
 * ``` javascript
 * await new CardListinteractor('.cards')
 *   .cards(0).clickThrough()
 * ```
 *
 * @function collection
 * @param {String} selector - Element query selector
 * @param {Object} [descriptors] - Interaction descriptors
 * @returns {Object} Property descriptor
 */
export default function(selector, descriptors = {}) {
  let ItemInteractor;

  // if an interactor was provided, use it
  if (descriptors.prototype instanceof Interactor) {
    ItemInteractor = descriptors;

    // otherwise, create a new one
  } else {
    ItemInteractor = interactor(function() {
      Object.assign(this, descriptors);
    });
  }

  return function(index) {
    // when no index is provided, map all elements to interactors
    if (typeof index === 'undefined') {
      return this.$$(selector).map((item) => {
        return new ItemInteractor(item);
      });

    // with an index, the scope is defined as a function that will
    // throw an error when the element at the index cannot be found;
    // this gives the interactor a chance to converge on the scope
    // existing before performing any interactions with it
    } else {
      return new ItemInteractor({
        parent: this,
        scope: () => {
          let items = this.$$(selector);

          if (!items[index]) {
            throw new Error(`unable to find "${selector}" at index ${index}`);
          }

          return items[index];
        }
      });
    }
  };
}

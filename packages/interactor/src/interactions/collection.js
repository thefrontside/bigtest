import Interactor from '../interactor';
import { action } from './helpers';

/**
 * Interaction creator for a collection of nested interactors. A
 * collection interaction takes an index as it's argument and returns
 * a nested interactor scoped to that element.
 *
 * ``` html
 * <ul class="checkboxes">
 *   <li><input type="checkbox" .../></li>
 *   <li><input type="checkbox" .../></li>
 *   <li><input type="checkbox" .../></li>
 * </ul>
 * ```

 * ``` javascript
 * \@interactor class CheckboxGroupInteractor {
 *   items = collection('input[type="checkbox"]');
 * }
 * ```
 *
 * Nested interactions return instances of the topmost interactor so
 * that the initial chain is never broken.
 *
 * ``` javascript
 * await checkboxGroup
 *   .items(0).click()
 *   .items(1).click();
 * ```
 *
 * Nested interactors also have an additional method, `#only()`, which
 * disables the default nested chaining behavior, but retains any
 * previous interactions.
 *
 * ``` javascript
 * await checkboxGroup
 *   .items(0).click()
 *   .items(1).only()
 *     .focus()
 *     .trigger('keydown', { which: 32 })
 * ```
 *
 * When calling a collection method without an index, an array of
 * un-nested interactors are returned, each corresponding to an
 * element in the DOM at the time the method was invoked.
 *
 * ``` javascript
 * checkboxGroup.items().length // => 3
 *
 * // checks all checkboxes
 * await checkboxGroup.do(function() {
 *   return this.items().reduce((group, item) => {
 *     return group.append(item.click());
 *   }, this);
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
 * \@interactor class CardsListInteractor {
 *   cards = collection('.card', {
 *     clickThrough: clickable('.card-link')
 *   });
 * }
 * ```
 *
 * You can also use another interactor class.
 *
 * ``` javascript
 * \@interactor class CardInteractor {
 *   clickThrough = clickable('.card-link');
 * }
 *
 * \@interactor class CardsListInteractor {
 *   cards = collection('.card', CardInteractor);
 * }
 * ```
 *
 * ``` javascript
 * await new CardListinteractor('.cards')
 *   .cards(0).clickThrough();
 * ```
 *
 * The collection interaction creator also accepts a function instead
 * of a selector. This function is invoked with any arguments given to
 * the resulting collection method and **must** return a new selector
 * string. When no arguments are provided, the selector should match
 * multiple elements within the current scope; when arguments are
 * given, the selector should match only one element within the
 * current scope.
 *
 * ``` javascript
 * \@interactor class CheckboxGroupInteractor {
 *   items = collection(value => {
 *     return `[type="radio"]${value ? '[value="${value}"]' : ''}`;
 *   })
 * }
 * ```
 *
 * ``` javascript
 * await checkBoxGroup
 *   .items('green').click()
 *   .items('red').click();
 * ```
 *
 * @function collection
 * @param {String|Function} selector - Element query selector or
 * function that returns a selector
 * @param {Object} [properties] - Interaction descriptors
 * @returns {Object} Property descriptor
 */
export default function(selector, properties = {}) {
  let scope = selector;

  // with a string selector, the scope is defined as a function that
  // will throw an error when the element at an index cannot be found
  if (typeof selector === 'string') {
    scope = function(index) {
      if (typeof index === 'number') {
        let items = this.$$(selector);

        if (!items[index]) {
          throw new Error(`unable to find "${selector}" at index ${index}`);
        }

        return items[index];
      } else {
        return selector;
      }
    };
  }

  return action(function(...args) {
    let ItemInteractor = properties.prototype instanceof Interactor
      ? properties : Interactor.from(properties);

    if (args.length) {
      return new ItemInteractor({
        scope: () => scope.apply(this, args),
        parent: this
      });
    } else {
      return this.$$(scope.call(this)).map(item => {
        return new ItemInteractor(item);
      });
    }
  });
}

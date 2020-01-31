import { action } from './helpers';
import { find } from './find';

/**
 * Converges on an element first existing in the DOM, then triggers a
 * click on that element.
 *
 * ``` html
 * <form ...>
 *   <button type="submit">
 *     ...
 *   </button>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('button').click();
 * await new Interactor('form').click('[type="submit"]');
 * ```
 *
 * @method Interactor#click
 * @param {String} [selector] - Nested element query selector
 * @returns {Interactor} A new instance with additional convergences
 */
export function click(selector) {
  return find.call(this, selector)
    .do(($node) => $node.click());
}

/**
 * Interaction creator for clicking a specific element within a
 * custom interactor class.
 *
 * ``` html
 * <div class="card">
 *   ...
 *   <a class="card-link" href="https://example.com">
 *     ...
 *   </a>
 * </div>
 * ```
 *
 * ``` javascript
 * \@interactor class CardInteractor {
 *   clickThrough = clickable('.card-link');
 * }
 * ```
 *
 * ``` javascript
 * await new CardInteractor('.card').clickThrough()
 * ```
 *
 * @function clickable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function() {
    return click.call(this, selector);
  });
}

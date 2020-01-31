import { action } from './helpers';
import { find } from './find';

/**
 * Converges on an element first existing in the DOM, then triggers a
 * focus event on that element.
 *
 * ``` html
 * <form ...>
 *   <input type="email" />
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('input').focus();
 * await new Interactor('form').focus('input[type="email"]');
 * ```
 *
 * @method Interactor#focus
 * @param {String} selector - Nested element query selector
 * @returns {Interactor} A new instance with additional convergences
 */
export function focus(selector) {
  return find.call(this, selector).do($node => {
    $node.focus();
  });
}

/**
 * Interaction creator for focusing a specific element within a custom
 * interactor class.
 *
 * ``` html
 * <form ...>
 *   <input type="email" />
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * \@interactor class FormInteractor {
 *   focusEmail = focusable('input[type="email"]');
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').focusEmail();
 * ```
 *
 * @function focusable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function() {
    return focus.call(this, selector);
  });
}

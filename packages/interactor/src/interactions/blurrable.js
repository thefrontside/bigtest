import { action } from './helpers';
import { find } from './find';

/**
 * Converges on an element first existing in the DOM, then triggers a
 * blur event on that element.
 *
 * ``` html
 * <form ...>
 *   <input type="email" />
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('input').blur();
 * await new Interactor('form').blur('input[type="email"]');
 * ```
 *
 * @method Interactor#blur
 * @param {String} [selector] - Nested element query selector
 * @returns {Interactor} A new instance with additional convergences
 */
export function blur(selector) {
  return find.call(this, selector).do($node => {
    $node.blur();
  });
}

/**
 * Interaction creator for blurring a specific element within a custom
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
 *   blurEmail = blurrable('input[type="email"]');
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').blurEmail();
 * ```
 *
 * @function blurrable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function() {
    return blur.call(this, selector);
  });
}

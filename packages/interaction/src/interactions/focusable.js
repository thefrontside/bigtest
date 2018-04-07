/* global Event */
import { action } from './helpers';

/**
 * Converges on an element first existing in the DOM, then triggers a
 * focus event on that element.
 *
 * ``` html
 * <form ...>
 *   <input type="email"/>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('input').focus()
 * await new Interactor('form').focus('input[type="email"]')
 * ```
 *
 * @method focus
 * @memberOf Interactor
 * @param {String} selector - Nested element query selector
 * @returns {Interactor} A new instance with additional convergences
 */
export function focus(selector) {
  return this.find(selector)
    .do(($node) => {
      $node.dispatchEvent(
        new Event('focus', {
          bubbles: true,
          cancelable: true
        })
      );
    });
}

/**
 * Interaction creator for focusing a specific element within a custom
 * interactor class.
 *
 * ``` html
 * <form ...>
 *   <input type="email"/>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * @interactor class FormInteractor {
 *   focusEmail = focusable('input[type="email"]')
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').focusEmail()
 * ```
 *
 * @function focusable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function() {
    return this.focus(selector);
  });
}

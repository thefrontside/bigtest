import { computed } from './helpers';

/**
 * Property creator for returning `true` or `false` when an element
 * has a specific class.
 *
 * ``` html
 * <form class="error" ...>
 *   <input id="name" class="error"/>
 *   <input type="email" id="email"/>
 * </form>
 * ```
 *
 * ``` javascript
 * @interactor class FormInteractor {
 *   hasErrors = hasClass('error')
 *   hasNameError = hasClass('input#name', 'error')
 *   hasEmailError = hasClass('input#email', 'error')
 * }
 * ```
 *
 * ``` javascript
 * new FormInteractor('form').hasErrors //=> true
 * new FormInteractor('form').hasNameError //=> true
 * new FormInteractor('form').hasEmailError //=> false
 * ```
 *
 * @function hasClass
 * @param {String} [selector] - Nested element query selector
 * @param {String} className - Classname to check for
 * @returns {Object} Property descriptor
 */
export default function(selector, className) {
  if (!className) {
    className = selector;
    selector = null;
  }

  return computed(function() {
    return this.$(selector).classList.contains(className);
  });
}

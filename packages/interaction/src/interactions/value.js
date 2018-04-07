import { computed } from './helpers';

/**
 * Returns the value of an input element.
 *
 * ``` html
 * <input value="Hello World!"/>
 * ```
 *
 * ``` javascript
 * new Interactor('input').value //=> "Hello World!"
 * ```
 *
 * @member {Boolean} value
 * @memberOf Interactor
 * @throws {Error} When the interactor scope cannot be found
 */
export function value() {
  return this.$root.value;
}

/**
 * Property creator for returning the value of an input element within
 * a custom interactor class.
 *
 * ``` html
 * <form>
 *   <input id="name" value="Foo Bar"/>
 * </form>
 * ```
 *
 * ``` javascript
 * @interactor class FormInteractor {
 *   name = value('input#name')
 * }
 * ```
 *
 * ``` javascript
 * new FormInteractor('form').name //=> "Foo Bar"
 * ```
 *
 * @function value
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return computed(function() {
    return this.$(selector).value;
  });
}

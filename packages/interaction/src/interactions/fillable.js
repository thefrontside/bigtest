/* global Event */
import { action } from './helpers';

/**
 * Converges on an element first existing in the DOM, then sets its
 * `value` property to the passed value, and triggers both `input` and
 * `change` events for the element.
 *
 * ``` html
 * <form ...>
 *   <input id="name"/>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('input').fill('value')
 * await new Interactor('form').fill('input#name', 'value')
 * ```
 *
 * @method fill
 * @memberOf Interactor
 * @param {String} [selector] - Nested element query selector
 * @param {String} value - Value to set
 * @returns {Interactor} A new instance with additional convergences
 */
export function fill(selectorOrValue, value) {
  let selector;

  // if value is not defined, it is assumed that the only passed
  // argument is the value for the root element
  if (typeof value === 'undefined') {
    value = selectorOrValue;
  } else {
    selector = selectorOrValue;
  }

  return this.find(selector)
    .do(($node) => {
      // React has a custom property descriptor for the `value`
      // property of input elements. To work around this, we cache any
      // custom value property descriptor and reapply it after an
      // input event was dispatched on the node.
      let descriptor = Object.getOwnPropertyDescriptor($node, 'value');

      // remove any artificial value property
      if (descriptor) delete $node.value;

      // set the actual value
      $node.value = value;

      // dispatch input event
      $node.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true
        })
      );

      // dispatch change event
      $node.dispatchEvent(
        new Event('change', {
          bubbles: true,
          cancelable: true
        })
      );

      // restore artificial value property descriptor
      if (descriptor) {
        Object.defineProperty($node, 'value', descriptor);
      }
    });
}

/**
 * Interaction creator for setting the value of a specific element
 * within a custom interactor class.
 *
 * ``` html
 * <form ...>
 *   <input id="name"/>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * @interactor class FormInteractor {
 *   fillName = fillable('input#name')
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').fillName('value')
 * ```
 *
 * @function fillable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function(value) {
    return this.fill(selector, value);
  });
}

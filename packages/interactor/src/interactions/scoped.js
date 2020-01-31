import Interactor from '../interactor';
import { computed } from './helpers';

/**
 * Returns a nested interactor scoped to the selector within the
 * current interactor's scope.
 *
 * ``` html
 * <form ...>
 *   <button type="submit">
 *     ...
 *   </button>
 *   ...
 * </form>
 * ```

 * ``` javascript
 * await new Interactor('form').scoped('[type="submit"]').click();
 * ```
 *
 * This is especially useful for returning nested interactors from
 * custom methods.
 *
 * ``` javascript
 * \@interactor class RadioGroupInteractor {
 *   radio(value) {
 *     return this.scoped(`[type="radio"][value="${value}"]`, {
 *       isDisabled: property('disabled')
 *     });
 *   }
 * }
 * ```
 *
 * ``` javascript
 * radioGroup.radio('option-1').isDisabled //=> Boolean
 * radioGroup.radio('option-1').click() //=> RadioGroupInteractor
 * ```
 *
 * @method Interactor#scoped
 * @param {String} selector - Nested element query selector
 * @param {Object} [properties] - Interaction descriptors
 * @returns {Interactor} A new nested interactor instance
 */
export function scoped(selector, properties = {}) {
  let ScopedInteractor = properties.prototype instanceof Interactor
    ? properties : Interactor.from(properties);

  return new ScopedInteractor({
    scope: () => this.$(selector),
    parent: this
  });
}

/**
 * Interaction creator for a single nested interactor.
 *
 * ``` html
 * <form class="login-form">
 *   <input type="text" name="username" />
 *   <input type="email" name="email" />
 *   <button type="submit">Login</button>
 * </form>
 * ```

 * ``` javascript
 * \@interactor class LoginFormInteractor {
 *   username = scoped('input[name="username"]')
 *   email = scoped('input[name="email"]')
 *   submit = clickable('button[type="submit"]')
 * }
 * ```
 *
 * Nested interactions return instances of the topmost interactor so
 * that the initial chain is never broken.
 *
 * ``` javascript
 * await loginForm
 *   .username.fill('darklord1926')
 *   .email.fill('tom.riddle@hogwarts.edu')
 *   .email.blur()
 *   .submit()
 * ```
 *
 * Nested interactors also have an additional method, `#only()`, which
 * disables the default nested chaining behavior, but retains any
 * previous interactions.
 *
 * ``` javascript
 * await loginForm
 *   .username.fill('h4x0r')
 *   .email.only()
 *     .fill('not@an@email')
 *     .blur()
 * ```
 *
 * With the second argument, you can define additional interactions
 * using the various interaction helpers.
 *
 * ``` html
 * <label class="field username-field">
 *   <span class="field-label">Username:</span>
 *   <input type="text" name="username" />
 * </label>
 * ```
 *
 * ``` javascript
 * \@interactor class FormInteractor {
 *   username = scoped('.username-field', {
 *     label: text('.field-label'),
 *     fillIn: fillable('input')
 *   })
 * }
 * ```
 *
 * You can also use another interactor class.
 *
 * ``` javascript
 * \@interactor class FieldInteractor {
 *   label = text('.field-label')
 *
 *   fillIn(value) {
 *     return this.scoped('input')
 *      .focus().fill(value).blur()
 *   }
 * }
 *
 * \@interactor class LoginFormInteractor {
 *   username = scoped('.username-field', FieldInteractor)
 *   email = scoped('.email-field', FieldInteractor)
 *   submit = clickable('button[type="submit"]')
 * }
 * ```
 *
 * ``` javascript
 * await loginForm
 *   .username.fillIn('darklord1926')
 *   .email.fillIn('tom.riddle@hogwarts.edu')
 *   .submit()
 * ```
 *
 * @function scoped
 * @param {String} selector - Element query selector
 * @param {Object} [descriptors] - Interaction descriptors
 * @returns {Object} Property descriptor
 */
export default function(selector, descriptors = {}) {
  return computed(function() {
    return scoped.call(this, selector, descriptors);
  });
}

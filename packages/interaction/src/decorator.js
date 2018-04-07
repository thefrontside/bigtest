import Interactor from './interactor';
import { isInteractor, isPropertyDescriptor } from './utils';

/**
 * ``` javascript
 * import { interactor } from '@bigtest/interactor';
 * ```
 *
 * Creates a custom interactor class from methods and properties of
 * another class. Instance initializers that define property
 * descriptors will have their descriptors added to the custom class's
 * prototype.
 *
 * ``` javascript
 * import {
 *   interactor,
 *   isPresent,
 *   clickable
 * } from '@bigtest/interactor';
 *
 * @interactor class CustomInteractor {
 *   // optional default scope for this interactor
 *   static defaultScope = '#some-element'
 *
 *   // `isPresent` returns a getter descriptor
 *   hasError = isPresent('div.error')
 *
 *   // `*able` helpers return method descriptors
 *   submit = clickable('button[type="submit"]')
 *
 *   // normal getters and methods work as well
 *   fillForm(name, email) {
 *     return this
 *       .fill('input#name', name)
 *       .fill('input#email', email)
 *       .submit()
 *   }
 * }
 * ```
 *
 * @function interactor
 * @param {Class} Class - The class to decorate
 * @returns {Class} Custom interactor class
 */
export default function interactor(Class) {
  let CustomInteractor = class extends Interactor {};
  let proto = Object.getOwnPropertyDescriptors(Class.prototype);

  // check instance properties for property descriptors
  for (let [key, value] of Object.entries(new Class())) {
    if (isPropertyDescriptor(value)) {
      proto[key] = value;

    // nested interactions need to return their parent
    } else if (isInteractor(value)) {
      proto[key] = {
        get() {
          return new value.constructor({
            parent: this
          }, value);
        }
      };

    // preserve other values
    } else {
      proto[key] = { value };
    }
  }

  // remove the given class's constructor
  delete proto.constructor;

  // ensure that interactor methods and properties are not overwritten
  // to avoid potential issues such as infinite recursion
  for (let key of Object.keys(proto)) {
    if (key in Interactor.prototype) {
      throw new Error(`cannot redefine existing property "${key}"`);
    }
  }

  // extend the custom interactor's prototype
  Object.defineProperties(CustomInteractor.prototype, proto);
  Object.defineProperty(CustomInteractor, 'name', { value: Class.name });

  // if a default scope was defined, use it
  if (Class.defaultScope) {
    Object.defineProperty(CustomInteractor, 'defaultScope', { value: Class.defaultScope });
  }

  return CustomInteractor;
}

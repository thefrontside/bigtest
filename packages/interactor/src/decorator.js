import Interactor from './interactor';

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
 * \@interactor class CustomInteractor {
 *   // optional default scope for this interactor
 *   static defaultScope = '#some-element';
 *
 *   // `isPresent` returns a getter descriptor
 *   hasError = isPresent('div.error');
 *
 *   // `*able` helpers return method descriptors
 *   submit = clickable('button[type="submit"]');
 *
 *   // normal getters and methods work as well
 *   fillForm(name, email) {
 *     return this
 *       .fill('input#name', name)
 *       .fill('input#email', email)
 *       .submit();
 *   }
 * }
 * ```
 *
 * @function interactor
 * @param {Object|Class} classDescriptor - A class descriptor or constructor
 * @returns {Class} Custom interactor class
 */
export default function interactor(classDescriptor) {
  return Interactor.extend(classDescriptor);
}

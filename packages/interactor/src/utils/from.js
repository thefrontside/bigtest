import Convergence from '@bigtest/convergence';
import isInteractor from './is-interactor';

const {
  assign,
  defineProperties,
  entries,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  hasOwnProperty
} = Object;

/**
 * Throws an error if an object contains reserved properties.
 *
 * @private
 * @param {Object} obj - Object to check for reserved properties
 * @returns {Object} obj - The object after being checked
 * @throws {Error} if any reserverd properties were found
 */
function checkForReservedPropertyNames(obj) {
  const blacklist = [
    '$', '$$', '$root', 'only', '__parent__',
    ...getOwnPropertyNames(Convergence.prototype)
  ];

  for (let key of getOwnPropertyNames(obj)) {
    if (blacklist.includes(key)) {
      throw new Error(`"${key}" is a reserved property name`);
    }
  }

  return obj;
}

/**
 * Returns true if an object has either `get` or `value` properties.
 *
 * @private
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isPropertyDescriptor(obj) {
  return obj &&
    (hasOwnProperty.call(obj, 'get') ||
     hasOwnProperty.call(obj, 'value'));
}

/**
 * Converts a value to a property descriptor. If already a descriptor,
 * it is returned. Given an interactor will return an accessor
 * descriptor which gives the interactor a parent reference. All other
 * values are set as the `value` property of a property descriptor.
 *
 * @private
 * @param {*} from
 * @returns {Object}
 */
function toInteractorDescriptor(from) {
  // already a property descriptor
  if (isPropertyDescriptor(from)) {
    return from;

  // nested interactors get parent references
  } else if (isInteractor(from)) {
    return {
      get() {
        return new from.constructor({
          parent: this
        }, from);
      }
    };

  // preserve all other values
  } else {
    return {
      value: from
    };
  }
}

/**
 * Creates a custom interactor class from methods and properties of an
 * object. Methods and getters are added to the custom class's
 * prototype and all other properties are defined during instance
 * initialization to support custom property creators.
 *
 * ``` javascript
 * import Interactor, {
 *   text,
 *   property,
 *   value,
 *   clickable
 * } from '@bigtest/interactor';
 *
 * const FieldInteractor = Interactor.from({
 *   label: text('label'),
 *   name: property('input', 'name'),
 *   type: property('input', 'type'),
 *   placeholder: property('input', 'placeholder'),
 *   value: value('input')
 * });
 *
 * const PasswordInteractor = FieldInteractor.from({
 *   toggleVisibility: clickable('.visibility-toggle')
 * });
 * ```
 *
 * @static
 * @alias Interactor.from
 * @param {Object} properties - Used to create a custom interactor
 * @returns {Class} Custom interactor class
 */

export default function from(properties) {
  class CustomInteractor extends this {};

  // define properties from descriptors
  defineProperties(
    CustomInteractor.prototype,
    checkForReservedPropertyNames(
      entries(
        getOwnPropertyDescriptors(properties)
      ).reduce((acc, [key, descr]) => assign(acc, {
        [key]: hasOwnProperty.call(descr, 'value')
        // some values are themselves descriptors
          ? toInteractorDescriptor(descr.value)
          : descr
      }), {})
    )
  );

  // define static properties
  if (properties.static) {
    defineProperties(
      CustomInteractor,
      getOwnPropertyDescriptors(properties.static)
    );
  }

  return CustomInteractor;
}

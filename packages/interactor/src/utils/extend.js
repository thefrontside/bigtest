const {
  assign,
  getOwnPropertyDescriptors,
  getPrototypeOf
} = Object;

/**
 * Super simple omit function. Can be easilty expanded to reduce over multiple
 * keys, however only one key is currently used.
 *
 * @private
 * @param {Object} obj
 * @param {String} key
 * @returns {Object}
 */
function omit(obj, key) {
  let { [key]: _, ...rest } = obj;
  return rest;
}

/**
 * Similar to the `\@interactor` decorator; creates a custom interactor class
 * from methods and properties of another class. However, this static method is
 * available on all interactor classes, which makes any interactor extendable.
 *
 * ``` javascript
 * import Interactor, {
 *   text,
 *   property,
 *   value,
 *   clickable
 * } from '@bigtest/interactor';
 *
 * \@Interactor.extend
 * class FieldInteractor {
 *   label = text('label');
 *   name = property('input', 'name');
 *   type = property('input', 'type');
 *   placeholder = property('input', 'placeholder');
 *   value = value('input');
 * }
 *
 * \@FieldInteractor.extend
 * class PasswordInteractor {
 *   toggleVisibility = clickable('.visibility-toggle');
 * }
 * ```
 *
 * @static
 * @alias Interactor.extend
 * @param {Object|Class} classDescriptor - A class descriptor or constructor
 * @returns {Class} Custom interactor class
 */
export default function extend(classDescriptor) {
  if (classDescriptor.kind === 'class') {
    let { kind, elements } = classDescriptor;

    return {
      kind,
      finisher: constructor => {
        return this.from(
          // collect all element descriptors and own properties
          elements.reduce((acc, el) => assign({
            [el.key]: el.placement === 'own'
              ? el.initializer()
              : el.descriptor
          }, acc), {
            // include static properties
            static: assign({
              // name is usually non-enumerable
              name: constructor.name
            }, constructor)
          })
        );
      }
    };

  // a class constructor was provided (legacy decorator syntax)
  } else if (typeof classDescriptor === 'function') {
    // console.warn(`Deprecated. Please upgrade to Stage 2 decorators.`);
    let constructor = classDescriptor;

    // make a pojo for `from`
    return this.from(assign({},
      // own properties
      new constructor(),
      // prototype properties
      omit(getOwnPropertyDescriptors(constructor.prototype), 'constructor'),
      // static properties (name is usually non-enumerable)
      { static: assign({ name: constructor.name }, constructor) }
    ));

  // plain objects are deprecated
  } else if (getPrototypeOf(classDescriptor) === Object.prototype) {
    console.warn(`Deprecated usage of decorator with plain objects. Use \`${this.name}.from\` instead.`);
    return this.from(classDescriptor);
  }
}

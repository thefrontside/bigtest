import Interaction from './interaction';
import { $, isPropertyDescriptor } from './helpers';

// the base page-object class
class PageObject {
  /**
   * @constructor
   * @param {String|Element} $root - selector or element to scope this
   * page's interactions to
   */
  constructor($root) {
    Object.defineProperties(this, {
      // the initial interaction convergence
      interaction: {
        value: new this.constructor.Interaction($root)
      },

      // the $root element getter
      $root: {
        get() {
          return $($root || document.body);
        }
      }
    });
  }
}

/**
 * Decorates a class using page-object properties
 *
 * Example:
 *   @page class TestPage {
 *     title = text('.title'),
 *     errors = count('.error'),
 *     fillName = fillable('.name-input')
 *     blurName = blurable('.name-input')
 *     submit = clickable('.btn')
 *   }
 *
 * @param {Class} Class - the class to decorate
 * @returns {Class} the decorated class
 */
export default function page(Class) {
  let instance = new Class();
  let properties = Object.getOwnPropertyNames(instance);

  // create the new page-object classes
  let Page = class extends PageObject {};
  Page.Interaction = class extends Interaction {};

  // additional prototypes are added with page-object properties
  let pageProto = Object.getOwnPropertyDescriptors(Page.prototype);
  let classProto = Object.getOwnPropertyDescriptors(Class.prototype);

  // check instance for page-object properties
  for (let i = 0, l = properties.length; i < l; i++) {
    let key = properties[i];
    let value = instance[key];

    // preserve raw values
    if (!isPropertyDescriptor(value)) {
      pageProto[key] = { value };

    // add to the custom interaction
    } else if (typeof value.value === 'function') {
      Page.Interaction.register(key, value.value);

      // forward to the custom interaction
      pageProto[key] = {
        value() {
          let action = this.interaction[key];
          return action.apply(this.interaction, arguments);
        }
      };

    // preserve other descriptors
    } else {
      pageProto[key] = value;
    }
  }

  // extend the new page-object class
  Object.defineProperties(Page.prototype, Object.assign(classProto, pageProto));
  Object.defineProperty(Page, 'name', { value: Class.name });

  return Page;
}

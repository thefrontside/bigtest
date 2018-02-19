import Interaction from './interaction';
import { $, $$, isPropertyDescriptor } from './utils';

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
      },

      // DOM helpers
      $: {
        value(selector) {
          return $(selector, this.$root);
        }
      },

      $$: {
        value(selector) {
          return $$(selector, this.$root);
        }
      }
    });
  }
}

/**
 * Returns a property descriptor for a page that calls the interaction
 * method with the given arguments
 *
 * @param {String} name - interaction method name
 * @returns {Object} page-object property descriptor
 */
function wrapPageInteraction(name) {
  return {
    value() {
      let method = this.interaction[name];
      return method.apply(this.interaction, arguments);
    }
  };
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
  // create the new page-object classes
  let Page = class extends PageObject {};
  Page.Interaction = class extends Interaction {};

  // additional prototypes are added with page-object properties
  let pageProto = Object.create(null);
  let interactionProto = Object.create(null);

  // make default interaction methods available on our page-object
  for (let name of Object.getOwnPropertyNames(Interaction.prototype)) {
    if (name !== 'constructor') {
      pageProto[name] = wrapPageInteraction(name);
    }
  }

  // check instance properties for page-object property descriptors
  for (let [key, value] of Object.entries(new Class())) {
    // preserve raw values
    if (!isPropertyDescriptor(value)) {
      pageProto[key] = { value };

    // method descriptors are added to the custom interaction and
    // the page-object method wraps the interaction method
    } else if (typeof value.value === 'function') {
      interactionProto[key] = value;
      pageProto[key] = wrapPageInteraction(key);

    // preserve other descriptors
    } else {
      pageProto[key] = value;
    }
  }

  // keep the class prototype, minus the constructor
  let classProto = Object.getOwnPropertyDescriptors(Class.prototype);
  delete classProto.constructor;

  // extend the new page-object class and interaction
  Object.defineProperties(Page.prototype, Object.assign(classProto, pageProto));
  Object.defineProperties(Page.Interaction.prototype, interactionProto);
  Object.defineProperty(Page, 'name', { value: Class.name });

  return Page;
}

import { $$ } from '../helpers';
import page from '../page-object';

/**
 * Page-object property creator for collections of objects that
 * have their own scoped properties
 *
 * @param {String} selector - query selector
 * @param {Object} [descriptors] - page-object property descriptors
 * @returns {Object} property descriptor
 */
export default function(selector, descriptors = {}) {
  let CollectionObject = page(class {
    constructor() {
      for (let [key, val] of Object.entries(descriptors)) {
        this[key] = val;
      }
    }
  });

  return function(index) {
    let items = $$(selector, this.$scope);

    if (typeof index === 'undefined') {
      return items.map((item) => new CollectionObject(item));
    } else if (items[index]) {
      return new CollectionObject(items[index]);
    } else {
      throw new Error(`unable to find "${selector}" at index ${index}`);
    }
  };
}

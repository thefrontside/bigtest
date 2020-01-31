import { computed } from './helpers';

/**
 * Property creator for returning an attribute of an element.
 *
 * ``` html
 * <div class="card" id="foo">
 *   ...
 *   <a class="card-link" href="https://example.com">
 *     ...
 *   </a>
 * </div>
 * ```
 *
 * ``` javascript
 * \@interactor class CardInteractor {
 *   id = attribute('id');
 *   url = attribute('.card-link', 'href');
 * }
 * ```
 *
 * ``` javascript
 * new CardInteractor('.card').id //=> "foo"
 * new CardInteractor('.card').url //=> "https://example.com"
 * ```
 *
 * @function attribute
 * @param {String} [selector] - Nested element query selector
 * @param {String} attr - Attribute name
 * @returns {Object} Property descriptor
 */
export default function(selector, attr) {
  if (!attr) {
    attr = selector;
    selector = null;
  }

  return computed(function() {
    return this.$(selector).getAttribute(attr);
  });
}

import { computed } from './helpers';

/**
 * Property creator for returning a property of an element.
 *
 * ``` html
 * <div class="card" style="height: 100px">
 *   ...
 *   <button class="card-cta" disabled>
 *     ...
 *   </button>
 * </div>
 * ```
 *
 * ``` javascript
 * @interactor class CardInteractor {
 *   height = property('offsetHeight')
 *   isDisabled = property('button.card-cta', 'disabled')
 * }
 * ```
 *
 * ``` javascript
 * new CardInteractor('.card').height //=> 100
 * new CardInteractor('.card').isDisabled //=> true
 * ```
 *
 * @function property
 * @param {String} [selector] - Nested element query selector
 * @param {String} prop - Property name
 * @returns {Object} Property descriptor
 */
export default function(selector, prop) {
  if (!prop) {
    prop = selector;
    selector = null;
  }

  return computed(function() {
    return this.$(selector)[prop];
  });
}

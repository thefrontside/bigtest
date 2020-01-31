import { action } from './helpers';
import { find } from './find';

/**
 * Converges on an element first existing in the DOM, then sets the
 * `scrollTop` and/or `scrollLeft` properties of the element, and then
 * finally triggers a scroll event on the element.
 *
 * ``` javascript
 * await new Interactor('#page').scroll({ top: 100 });
 * await new Interactor('#page').scroll('.nested-view', { left: 100 });
 * ```
 *
 * @method Interactor#scroll
 * @param {String} [selector] - Nested element query selector
 * @param {Number} scrollTo.top - Number of pixels to scroll the top-offset
 * @param {Number} scrollTo.left - Number of pixels to scroll the left-offset
 * @returns {Interactor} A new instance with additional convergences
 */
export function scroll(selectorOrScrollTo, scrollTo) {
  let selector;

  // if `scrollTo` is not defined, it is assumed that the only passed
  // argument is the scroll values for the scoped element
  if (typeof scrollTo === 'undefined') {
    scrollTo = selectorOrScrollTo;
  } else {
    selector = selectorOrScrollTo;
  }

  return find.call(this, selector)
    .do(($node) => {
      if (typeof scrollTo.left === 'number') {
        $node.scrollLeft = scrollTo.left;
      }

      if (typeof scrollTo.top === 'number') {
        $node.scrollTop = scrollTo.top;
      }

      $node.dispatchEvent(
        new Event('scroll', {
          bubbles: true,
          cancelable: true
        })
      );
    });
}

/**
 * Interaction creator for scrollilng a specific element within a
 * custom interactor class.
 *
 * ``` javascript
 * \@interactor class PageInteractor {
 *   scrollSection = scrollable('.scrollview')
 * }
 * ```
 *
 * ``` javascript
 * await new PageInteractor('#page').scrollSection({ top: 100 })
 * ```
 *
 * @function scrollable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function(scrollTo) {
    return scroll.call(this, selector, scrollTo);
  });
}

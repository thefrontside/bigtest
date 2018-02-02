/* global Event */
import { createPropertyDescriptor } from '../helpers';

/**
 * Adds a convergence for scrolling an element existing in the
 * DOM. This method works with one or two arguments. If given one
 * argument, it is used as the scroll values to scroll the interaction's
 * scoped element. Given a second argument, the first is used a query
 * selector string to select an element for scrolling.
 *
 * @param {String} selectorOrScrollTo - query selector string or
 * scroll values if the second argument is not provided
 * @param {String} [scrollTo] - if provided, the first argument is
 * used as the query selector string
 * @returns {Interaction}
 */
export function scroll(selectorOrScrollTo, scrollTo) {
  let selector;

  // if scrollTo is not defined, it is assumed that the only passed
  // argument is the scroll values for the root element
  if (typeof scrollTo === 'undefined') {
    scrollTo = selectorOrScrollTo;
  } else {
    selector = selectorOrScrollTo;
  }

  return this.select(selector)
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
 * Page-object property creator
 *
 * @param {String} selector - query selector
 * @returns {Object} property descriptor
 */
export default function(selector) {
  return createPropertyDescriptor({
    value(scrollTo) {
      return this.scroll(selector, scrollTo);
    }
  });
}

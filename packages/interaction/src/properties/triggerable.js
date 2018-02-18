/* global Event */
import { createPropertyDescriptor } from '../helpers';

/**
 * Adds a convergence for triggering an event on an element existing
 * in the DOM. If the second argument is not an event name, we assume
 * the event name was passed as the first argument and the second
 * argument becomes the event options. Otherwise, the first arugment
 * is used as the selector, the second as the event name, and the
 * third argument is for the event options.
 *
 * @param {String} selectorOrEventName - query selector string or event name
 * @param {String|Object} [eventNameOrOptions] - event name or options object
 * @param {Object} [options] - the event options
 * @returns {Interaction}
 */
export function trigger(selectorOrEventName, eventNameOrOptions, options) {
  let selector, eventName;

  // if the second argument is not an event name, we assume that the
  // event name was given as the first argument
  if (typeof eventNameOrOptions !== 'string') {
    eventName = selectorOrEventName;
    options = eventNameOrOptions;
  } else {
    selector = selectorOrEventName;
    eventName = eventNameOrOptions;
  }

  // default options to an empty object
  if (!options) {
    options = {};
  }

  return this.find(selector)
    .do(($node) => {
      // default options for any event
      let bubbles = options.hasOwnProperty('bubbles') ? options.bubbles : true;
      let cancelable = options.hasOwnProperty('cancelable') ? options.cancelable : true;

      // remove these so we can assign the rest later
      delete options.bubbles;
      delete options.cancelable;

      // create the event from the normal Event interface and extend it
      let event = new Event(eventName, { bubbles, cancelable });
      Object.assign(event, options);

      // dispatch the event
      $node.dispatchEvent(event);
    });
}

/**
 * Page-object property creator. Optionally, the selector can be
 * omitted as the second argument to target the root element and
 * options can be provided as the second argument instead.
 *
 * @param {String} eventName - event name
 * @param {String|Object} [selectorOrOptions] - query selector string
 * or options object
 * @param {Object} [options] - options object if a selector is provided
 * @returns {Object} property descriptor
 */
export default function(eventName, selectorOrOptions, options) {
  let selector;

  // if the second argument is a string, we assume it is a selector,
  // otherwise it is options
  if (typeof selectorOrOptions === 'string') {
    selector = selectorOrOptions;
  } else {
    options = selectorOrOptions;
  }

  return createPropertyDescriptor(function() {
    return this.trigger(selector, eventName, options);
  });
}

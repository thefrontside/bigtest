/* global Event */
import { action } from './helpers';

/**
 * Trigger has two forms, both of which have an optional last
 * argument. This function normalizes the shorter form to match the
 * argument positions of the longer form.
 *
 * @param {Array} args - Arguments for `#trigger()`
 * @returns {Array} Normalized arguments
 */
function getTriggerArgs(args) {
  let selector, eventName, options;

  // trigger(selector, eventName, options)
  if (args.length === 3) {
    [selector, eventName, options] = args;

  // trigger(selector, eventName)
  // trigger(eventName, options)
  } else if (args.length === 2) {
    if (typeof args[1] === 'string') {
      [selector, eventName] = args;
    } else {
      [eventName, options] = args;
    }

  // trigger(eventName)
  } else {
    [eventName] = args;
  }

  return [selector, eventName, options];
}

/**
 * Converges on an element first existing in the DOM, then triggers a
 * specified event with optional event init options.
 *
 * ``` javascript
 * await new Interactor('#foo').trigger('customEvent')
 * await new Interactor('#foo').trigger('customEvent', { ... })
 * await new Interactor('#foo').trigger('#bar', 'customEvent')
 * await new Interactor('#foo').trigger('#bar', 'customEvent', { ... })
 * ```
 *
 * @param {String} [selector] - Nested element query selector
 * @param {String} eventName - Event name or options object
 * @param {Object} [options] - Event init options
 * @returns {Interactor} A new instance with additional convergences
 */
export function trigger(...args) {
  let [selector, eventName, options = {}] = getTriggerArgs(args);

  return this.find(selector)
    .do(($node) => {
      // default options for any event
      let bubbles = 'bubbles' in options ? options.bubbles : true;
      let cancelable = 'cancelable' in options ? options.cancelable : true;

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
 * Interaction creator for triggering an event on a specific element
 * within a custom interactor class.
 *
 * ``` javascript
 * @interactor class PageInteractor {
 *   triggerEvent = triggerable('customEvent', { ... })
 *   triggerFooEvent = triggerable('#foo', 'customEvent')
 * }
 * ```
 *
 * ``` javascript
 * await new PageInteractor().triggerEvent()
 * await new PageInteractor().triggerEvent({ ... })
 * await new PageInteractor().triggerFooEvent()
 * await new PageInteractor().triggerFooEvent({ ... })
 * ```
 *
 * @param {String} [selector] - Element query selector
 * @param {String} eventName - Event name or options object
 * @param {Object} [options] - Event init options
 * @returns {Object} Property descriptor
 */
export default function(...args) {
  let [selector, eventName, options = {}] = getTriggerArgs(args);

  return action(function(opts) {
    opts = Object.assign({}, options, opts);
    return this.trigger(selector, eventName, opts);
  });
}

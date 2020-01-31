import Convergence from '@bigtest/convergence';

import { $, $$ } from './utils/dom';
import makeParentChainable from './utils/parent-chainable';
import isInteractor from './utils/is-interactor';
import extend from './utils/extend';
import from from './utils/from';

import { find } from './interactions/find';
import { findAll } from './interactions/find-all';
import { scoped } from './interactions/scoped';
import { click } from './interactions/clickable';
import { fill } from './interactions/fillable';
import { select } from './interactions/selectable';
import { focus } from './interactions/focusable';
import { blur } from './interactions/blurrable';
import { trigger } from './interactions/triggerable';
import { scroll } from './interactions/scrollable';
import { text } from './interactions/text';
import { value } from './interactions/value';
import { isVisible } from './interactions/is-visible';
import { isHidden } from './interactions/is-hidden';
import { isPresent } from './interactions/is-present';

const {
  assign,
  entries,
  defineProperties,
  getOwnPropertyDescriptor
} = Object;

/**
 * ``` javascript
 * import Interactor from '@bigtest/interactor';
 * ```
 *
 * In biology, an _interactor_ is defined as part of an organism that
 * natural selection acts upon. A `@bigtest/interactor` interactor
 * defines part of an _app_ that _tests_ act upon.
 *
 * ``` javascript
 * let input = new Interactor('input');
 *
 * await input
 *   .focus()
 *   .fill('some value')
 *   .blur();
 *
 * expect(input.value).to.equal('some value');
 * ```
 *
 * Interactors are [Convergences](/docs/convergence). They directly
 * extend the `Convergence` class and as such are immutable, reusable,
 * and composable.
 *
 * ``` javascript
 * let input = new Interactor('input');
 * let submit = new Interactor('button[type="submit"]');
 *
 * let fillAndSubmit = value => {
 *   return input.fill(value)
 *     .append(submit.click());
 * }
 *
 * await fillAndSubmit('some value');
 * ```
 *
 * Interactors don't have to be narrowly scoped either. The various
 * interaction methods support passing a selector as the first
 * argument.
 *
 * ``` javascript
 * new Interactor('#some-form')
 *   .fill('input[type="email"]', 'email@domain.tld')
 *   .click('button[type="submit"]');
 * ```
 *
 * You can create custom interactors by extending the class...
 *
 * ``` javascript
 * class FormInteractor extends Interactor {
 *   fillEmail(email) {
 *     // return an instance of this interactor to allow chaining
 *     return this.fill('input[type="email"]', email);
 *   }
 *
 *   submit() {
 *     return this.click('button[type="submit"]');
 *   }
 *
 *   fillAndSubmit(email) {
 *     return this
 *       .fillEmail(email)
 *       .submit();
 *   }
 * }
 * ```
 *
 * ... or use the [`interactor`](#interactor) class decorator in
 * conjuction with the various interaction helpers.
 *
 * ``` javascript
 * import { interactor, fillable, clickable } from '@bigtest/interactor';
 *
 * \@interactor class FormInteractor {
 *   fillEmail = fillable('input[type="email"]');
 *   submit = clickable('button[type="submit"]');
 *
 *   fillAndSubmit(email) {
 *     return this
 *       .fillEmail(email)
 *       .submit();
 *   }
 * }
 * ```
 *
 * Interactors also have a static `from` method to create custom
 * interactors. You can even extend from custom interactors.
 *
 * ``` javascript
 * const FormInteractor = Interactor.from({
 *   fillEmail: fillable('input[type="email"]'),
 *   submit: clickable('button[type="submit"]'),
 *
 *   fillAndSubmit(email) {
 *     return this
 *       .fillEmail(email)
 *       .submit();
 *   }
 * });
 * ```
 *
 * Custom interactors also have a static `extend` decorator available
 * that you can use to extend from custom interactors while still
 * using the class syntax.
 *
 * ``` javascript
 * \@FieldInteractor.extend
 * class PasswordInteractor {
 *   // ...
 * }
 * ```
 */
class Interactor extends Convergence {
  /**
   * The constructor arguments mimic convergence constructor arguments
   * in that new instances receive new `options` in addition to the
   * `previous` instance. Publicly, however, an Interactor's only
   * constructing argument is currently `scope`. But that may change
   * in the future to support providing an initial timeout or adding
   * additional interactor-specific options.
   *
   * @constructor
   * @param {String|Element|Function} [scope] - The selector or
   * element this interactor is scoped to. When provided a function,
   * it is lazily evaluated whenever the scope getter is invoked
   */
  constructor(options = {}, previous = {}) {
    // a scope selector, element, or function was given
    if (typeof options === 'string' ||
        options instanceof Element ||
        typeof options === 'function') {
      options = { scope: options };
    }

    // convergence setup
    super(options, previous);

    let {
      parent = previous.__parent__,
      scope = this.constructor.defaultScope
    } = options;

    // define any parent and the root element getter for this instance
    defineProperties(this, {
      __parent__: { value: parent },

      // the previous root descriptor always takes precedence
      $root: getOwnPropertyDescriptor(previous, '$root') || {
        get: () => $(typeof scope === 'function' ? scope() : scope)
      }
    });

    // given a parent, make all methods and getters return
    // parent-chainable instances of themselves
    if (parent) {
      makeParentChainable(this);
    }
  }

  /**
   * A `querySelector`-like method that is scoped to the current
   * interactor. Unlike `querySelector`, this method will throw an
   * error when the element cannot be found.
   *
   * ``` javascript
   * let page = new Interactor('#page-scope');
   *
   * // returns an element matching `#page-scope .some-element`, and
   * // throws an error if it cannot be found
   * page.$('.some-element');
   * ```
   *
   * @param {String} selector - Selector string
   * @throws {Error} When the element or scope cannot be found
   * @returns {Element} Element found via `querySelector`
   */
  $(selector) {
    return $(selector, this.$root);
  }

  /**
   * A `querySelectorAll`-like method that is scoped to the current
   * interactor and returns an array instead of a nodelist. If
   * `selector` cannot be found, an empty array is returned. If the
   * current scope cannot be found, an error is thrown.
   *
   * ``` javascript
   * let list = new Interactor('ul.some-list');
   *
   * // returns an array of elements matching `ul.some-list li`; only
   * // throws an error when `ul.some-list` cannot be found
   * page.$$('li');
   * ```
   *
   * @param {String} selector - Selector string
   * @throws {Error} When the interactor scope cannot be found
   * @returns {Array} Array of elements found via `querySelectorAll`
   */
  $$(selector) {
    return $$(selector, this.$root);
  }

  /**
   * Pauses an interactor by halting the convergence while it is
   * running with an unresolving promise.
   *
   * This is a hack which causes the event loop to hang and in some
   * situations become unresponsive. Consider moving any teardown code
   * to execute _before_ setup. This way, when a test is finished, the
   * DOM and state is preserved for interacting with and inspecting.
   *
   * @deprecated
   * @returns {Interactor} An instance of this interactor which will
   * halt when it encounters this method in the convergence stack
   */
  pause() {
    console.warn(`Using \`#pause()\` is deprecated.
It is a hack that prevents the current event loop from running, \
and can cause some browsers or processes to hang.`);

    return this.do(() => new Promise(() => {}));
  }
}

// static methods and properties
defineProperties(Interactor, {
  isInteractor: { value: isInteractor },

  // ensure these are always bound to their respective classes
  extend: { get() { return extend.bind(this); } },
  from: { get() { return from.bind(this); } },

  /**
   * The default selector or element an interactor is scoped to when a
   * scope is not provided during initialization.
   *
   * ``` javascript
   * new Interactor().$root //=> document.body
   * ```
   *
   * When extending the `Interactor` class, this static property may
   * be overridden to define a new default scope.
   *
   * ``` javascript
   * class CustomInteractor extends Interactor {
   *   static defaultScope = '#some-element';
   * }
   *
   * new CustomInteractor().$root //=> <div id="some-element">...</div>
   * ```
   *
   * @static
   * @member {String|Element} Interactor.defaultScope
   * @default document.body
   */
  defaultScope: { value: document.body }
});

// default interaction methods
defineProperties(
  Interactor.prototype,
  entries({
    find,
    findAll,
    scoped,
    click,
    fill,
    select,
    focus,
    blur,
    trigger,
    scroll
  }).reduce((descriptors, [name, method]) => {
    return assign(descriptors, {
      [name]: { value: method }
    });
  }, {})
);

defineProperties(
  Interactor.prototype,
  entries({
    text,
    value,
    isVisible,
    isHidden,
    isPresent
  }).reduce((descriptors, [name, getter]) => {
    return assign(descriptors, {
      [name]: { get: getter }
    });
  }, {})
);

export default Interactor;

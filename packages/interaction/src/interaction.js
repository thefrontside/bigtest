/* global Element */
import Convergence from '@bigtest/convergence';
import { $ } from './helpers';

// import all default interaction methods
import * as interactions from './properties/interactions';

/**
 * Interaction class to perform multiple interactions with the DOM
 * within one convergence period
 */
export default class Interaction extends Convergence {
  /**
   * @constructor
   * @param {Node|String} [$scope] - the node this interaction is scoped to
   * @param {Convergence} [convergence] - the convergence to start with
   */
  constructor(options = {}, prev = {}) {
    super(options, prev);

    // a scope selector or element was given
    if (typeof options === 'string' || options instanceof Element) {
      options = { $scope: options };
    }

    // use the previous scope descriptor if there was one
    let prevScope = Object.getOwnPropertyDescriptor(prev, '$scope');

    Object.defineProperty(this, '$scope', prevScope || {
      get: () => $(options.$scope || document.body)
    });
  }
}

// add default interaction methods
Object.defineProperties(
  Interaction.prototype,
  Object.entries(interactions).reduce((props, [name, value]) => {
    return Object.assign(props, { [name]: { value } });
  }, {})
);

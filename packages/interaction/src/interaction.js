import Convergence from '@bigtest/convergence';
import { $, isPropertyDescriptor } from './helpers';
import * as interactions from './properties/interactions';

/**
 * Interaction class to perform multiple interactions with the DOM
 * within one convergence period
 */
export default class Interaction {
  /**
   * @constructor
   * @param {Node|String} [$scope] - the node this interaction is scoped to
   * @param {Convergence} [convergence] - the convergence to start with
   */
  constructor($scope, convergence) {
    let properties = {
      // the convergence for this instance
      convergence: {
        value: convergence || new Convergence()
      },

      // Sometimes, due to it's immutability, this class can be
      // initialized with a previous $scope descriptor. We use the
      // existing descriptor in this case, otherwise we create one.
      $scope: isPropertyDescriptor($scope) ? $scope : {
        get() {
          return $($scope || document.body);
        }
      },

      // .run() forwards to the convergence
      run: {
        value() {
          return this.convergence.run();
        }
      }
    };

    // wrap convergence methods for immutability
    ['once', 'always', 'do', 'timeout'].forEach((method) => {
      properties[method] = {
        value(...args) {
          return new this.constructor(
            Object.getOwnPropertyDescriptor(this, '$scope'),
            this.convergence[method](...args)
          );
        }
      };
    });

    // define instance properties
    Object.defineProperties(this, properties);
  }
}

// default interaction methods
Object.defineProperties(
  Interaction.prototype,
  Object.entries(interactions).reduce((props, [name, value]) => {
    return Object.assign(props, { [name]: { value } });
  }, {})
);

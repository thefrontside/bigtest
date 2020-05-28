export { Options, setDefaultOptions } from './options';
export { Interactor } from './interactor';

import { defaultSpecification, InteractorSpecification, InteractorInstance, InteractorType } from './specification';
import { Locator } from './locator';
import { Interactor } from './interactor';
import { interaction } from './interaction';
import { converge } from './converge';
import { defaultOptions } from './options';

export function interactor<E extends Element>(name: string) {
  return function<S extends InteractorSpecification<E>>(specification: Partial<S>): InteractorType<E, S> {
    let fullSpecification: InteractorSpecification<Element> = Object.assign({ selector: name }, defaultSpecification, specification);

    function makeInteractor(locator: Locator<E>): InteractorInstance<E, S> {
      let interactor = new Interactor(name, fullSpecification, locator as Locator<Element>);

      for(let [name, action] of Object.entries(specification.actions || {})) {
        Object.defineProperty(interactor, name, {
          value: function() {
            return interaction(`performing ${name} on ${this.description}`, () => {
              return converge(defaultOptions.timeout, () => {
                let element = this.unsafeSyncResolve();
                return action(element);
              });
            });
          },
          configurable: true,
          writable: true,
          enumerable: false,
        });
      }

      return interactor as InteractorInstance<E, S>;
    }

    let result = function(value: string): InteractorInstance<E, S> {
      return makeInteractor(new Locator(fullSpecification.defaultLocator, value));
    }

    for(let [name, locatorFn] of Object.entries(specification.locators || {})) {
      Object.defineProperty(result, name, {
        value: function(value: string) {
          return makeInteractor(new Locator(locatorFn, value, name));
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return result as InteractorType<E, S>;
  }
}

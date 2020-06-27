import { defaultSpecification, InteractorSpecification, InteractorType, LocatorSpecification, ActionSpecification } from './specification';
import { Locator } from './locator';
import { Interactor } from './interactor';
import { interaction } from './interaction';
import { converge } from './converge';

export function createInteractor<E extends Element>(interactorName: string) {
  return function <
    L extends LocatorSpecification<E>,
    A extends ActionSpecification<E>
  >(specification: Partial<InteractorSpecification<E, L, A>>): InteractorType<E, L, A> {
    let fullSpecification = Object.assign({}, defaultSpecification, specification) as unknown as InteractorSpecification<E, L, A>;

    let InteractorClass = class extends Interactor<E, InteractorSpecification<E, L, A>> {};

    for(let [actionName, action] of Object.entries(specification.actions || {})) {
      Object.defineProperty(InteractorClass.prototype, actionName, {
        value: function() {
          return interaction(`performing ${actionName} on ${this.description}`, () => {
            return converge(() => {
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

    let result = function(value: string) {
      let locator = new Locator(fullSpecification.defaultLocator, value);
      return new InteractorClass(interactorName, fullSpecification, locator);
    }

    for(let [locatorName, locatorFn] of Object.entries(specification.locators || {})) {
      Object.defineProperty(result, locatorName, {
        value: function(value: string) {
          let locator = new Locator(locatorFn, value, locatorName);
          return new InteractorClass(interactorName, fullSpecification, locator);
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return result as unknown as InteractorType<E, L, A>;
  }
}

import { defaultSpecification, InteractorSpecification, InteractorType } from './specification';
import { Locator } from './locator';
import { Interactor } from './interactor';
import { interaction } from './interaction';
import { converge } from './converge';
import { defaultOptions } from './options';

export function defineInteractor<E extends Element>(interactorName: string) {
  return function<S extends InteractorSpecification<E>>(specification: Partial<S>) {
    let fullSpecification: InteractorSpecification<Element> = Object.assign({ selector: interactorName }, defaultSpecification, specification);

    let InteractorClass = class extends Interactor {};

    for(let [actionName, action] of Object.entries(specification.actions || {})) {
      Object.defineProperty(InteractorClass.prototype, actionName, {
        value: function() {
          return interaction(`performing ${actionName} on ${this.description}`, () => {
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

    let result = function(value: string) {
      let locator = new Locator(fullSpecification.defaultLocator, value);
      let interactor = new InteractorClass(interactorName, fullSpecification, locator);
      return interactor;
    }

    for(let [locatorName, locatorFn] of Object.entries(specification.locators || {})) {
      Object.defineProperty(result, locatorName, {
        value: function(value: string) {
          let locator = new Locator(locatorFn, value, locatorName);
          let interactor = new InteractorClass(interactorName, fullSpecification, locator as Locator<Element>);
          return interactor;
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return result as InteractorType<E, S>;
  }
}

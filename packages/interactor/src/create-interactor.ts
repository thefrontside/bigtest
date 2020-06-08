import { InteractorSpecification, FilterImplementation, InteractorInstance, InteractorType, LocatorFn } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { Interactor } from './interactor';
import { interaction } from './interaction';
import { converge } from './converge';

const defaultLocator: LocatorFn<Element> = (element) => element.textContent || "";

export function createInteractor<E extends Element>(interactorName: string) {
  return function<S extends InteractorSpecification<E>>(specification: S): InteractorType<E, S> {
    let InteractorClass = class extends Interactor<E, S> {};

    for(let [actionName, action] of Object.entries(specification.actions || {})) {
      Object.defineProperty(InteractorClass.prototype, actionName, {
        value: function(...args: unknown[]) {
          let actionDescription = actionName;
          if(args.length) {
            actionDescription += ` with ` + args.map((a) => JSON.stringify(a)).join(', ');
          }
          return interaction(`${actionDescription} on ${this.description}`, () => {
            return converge(() => {
              let element = this.unsafeSyncResolve();
              return action(element, ...args);
            });
          });
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    let result = function(value: string, filters?: FilterImplementation<E, S>): InteractorInstance<E, S> {
      let locator = new Locator(specification.defaultLocator || defaultLocator, value);
      let filter = new Filter(specification, filters || {});
      let interactor = new InteractorClass(interactorName, specification, locator, filter);
      return interactor as InteractorInstance<E, S>;
    }

    for(let [locatorName, locatorFn] of Object.entries(specification.locators || {})) {
      Object.defineProperty(result, locatorName, {
        value: function(value: string, filters?: FilterImplementation<E, S>): InteractorInstance<E, S> {
          let locator = new Locator(locatorFn, value, locatorName);
          let filter = new Filter(specification, filters || {});
          let interactor = new InteractorClass(interactorName, specification, locator, filter);
          return interactor as InteractorInstance<E, S>;
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return result as InteractorType<E, S>;
  }
}

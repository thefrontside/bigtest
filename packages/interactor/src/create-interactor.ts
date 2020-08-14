import { InteractorSpecification, FilterImplementation, InteractorInstance, InteractorType, LocatorFn, LocatorSpecification } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { Interactor } from './interactor';
import { interaction } from './interaction';
import { converge } from './converge';

const defaultLocator: LocatorFn<Element> = (element) => element.textContent || "";

export function createInteractor<E extends Element>(interactorName: string) {
  return function<S extends InteractorSpecification<E, L>, L extends LocatorSpecification<E>>(specification: S): InteractorType<E, S, L> {
    let InteractorClass = class extends Interactor<E, S, L> {};

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

    let result = function(value: string, filters?: FilterImplementation<E, S>): InteractorInstance<E, S, L> {
      let locator = new Locator(specification.defaultLocator || defaultLocator, value, { locators: specification.locators });
      let filter = new Filter(specification, filters || {});
      let interactor = new InteractorClass(interactorName, specification, locator, filter);
      return interactor as InteractorInstance<E, S, L>;
    }

    for(let [locatorName, locatorFn] of Object.entries(specification.locators || {})) {
      Object.defineProperty(result, locatorName, {
        value: function(value: string, filters?: FilterImplementation<E, S>): InteractorInstance<E, S, L> {
          let locator = new Locator(locatorFn, value, { name: locatorName });
          let filter = new Filter(specification, filters || {});
          let interactor = new InteractorClass(interactorName, specification, locator, filter);
          return interactor as InteractorInstance<E, S, L>;
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    return result as InteractorType<E, S, L>;
  }
}

import { bigtestGlobals } from '@bigtest/globals';
import { InteractorSpecification, FilterParams, Filters, Actions, Children, InteractorConstructor, InteractorInstance, LocatorFn } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { Interactor } from './interactor';
import { interaction } from './interaction';
import { converge } from './converge';

const defaultLocator: LocatorFn<Element> = (element) => element.textContent || "";

export function createInteractor<E extends Element>(interactorName: string) {
  return function<F extends Filters<E> = {}, A extends Actions<E> = {}, C extends Children = {}>(specification: InteractorSpecification<E, F, A, C>): InteractorConstructor<E, F, A, C> {
    let InteractorClass = class extends Interactor<E, F, A, C> {};

    for(let [actionName, action] of Object.entries(specification.actions || {})) {
      Object.defineProperty(InteractorClass.prototype, actionName, {
        value: function(...args: unknown[]) {
          let actionDescription = actionName;
          if(args.length) {
            actionDescription += ` with ` + args.map((a) => JSON.stringify(a)).join(', ');
          }
          return interaction(`${actionDescription} on ${this.description}`, async () => {
            if(bigtestGlobals.runnerState === 'assertion') {
              throw new Error(`tried to ${actionDescription} on ${this.description} in an assertion, actions should only be performed in steps`);
            }
            return await converge(() => {
              return action(this, ...args);
            });
          });
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    for(let [childName, child] of Object.entries(specification.children || {})) {
      Object.defineProperty(InteractorClass.prototype, childName, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: function(...args: any[]) {
          if(typeof(child) === 'object') {
            return child.find(this, ...args);

          } else {
            return this.find(child(...args));
          }
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    function initInteractor(filters?: FilterParams<E, F>): InteractorInstance<E, F, A, C>;
    function initInteractor(value: string, filters?: FilterParams<E, F>): InteractorInstance<E, F, A, C>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function initInteractor(...args: any[]) {
      let locator, filter;
      if(typeof(args[0]) === 'string') {
        locator = new Locator(specification.locator || defaultLocator, args[0]);
        filter = new Filter(specification, args[1] || {});
      } else {
        filter = new Filter(specification, args[0] || {});
      }
      return new InteractorClass(interactorName, specification, filter, locator) as InteractorInstance<E, F, A, C>;
    }

    return initInteractor;
  }
}

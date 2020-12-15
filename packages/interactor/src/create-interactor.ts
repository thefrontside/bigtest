import { bigtestGlobals } from '@bigtest/globals';
import { InteractorSpecification, InteractorBuilder, InteractorConstructor, FilterParams, Filters, Actions, InteractorInstance, LocatorFn } from './specification';
import { Locator } from './locator';
import { Filter } from './filter';
import { Interactor } from './interactor';
import { interaction } from './interaction';

const defaultLocator: LocatorFn<Element> = (element) => element.textContent || "";


/**
 * Create a custom interactor. Due to TypeScript inference issues, this creates an
 * {@link InteractorBuilder}, which you will need to create the actual
 * interactor. See {@link InteractorSpecification} for detailed breakdown of
 * available options for the builder.
 *
 * ## Creating a simple interactor
 *
 * ``` typescript
 * let Paragraph = createInteractor('paragraph')({ selector: 'p' });
 * ```
 *
 * Note the double function call!
 *
 * @param interactorName The human readable name of the interactor, used mainly for debugging purposes and error messages
 * @typeParam E The type of DOM Element that this interactor operates on. By specifying the element type, actions and filters defined for the interactor can be type checked against the actual element type.
 * @returns You will need to call the returned builder to create an interactor.
 */
export function createInteractor<E extends Element>(interactorName: string): InteractorBuilder<E> {
  return function<F extends Filters<E> = {}, A extends Actions<E> = {}>(specification: InteractorSpecification<E, F, A>): InteractorConstructor<E, F, A> {
    let InteractorClass = class extends Interactor<E, F, A> {};

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
            return action(this, ...args);
          });
        },
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    function initInteractor(filters?: FilterParams<E, F>): InteractorInstance<E, F, A>;
    function initInteractor(value: string, filters?: FilterParams<E, F>): InteractorInstance<E, F, A>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function initInteractor(...args: any[]) {
      let locator, filter;
      if(typeof(args[0]) === 'string') {
        locator = new Locator(specification.locator || defaultLocator, args[0]);
        filter = new Filter(specification, args[1] || {});
      } else {
        filter = new Filter(specification, args[0] || {});
      }
      return new InteractorClass(interactorName, specification, filter, locator) as InteractorInstance<E, F, A>;
    }

    return initInteractor;
  }
}

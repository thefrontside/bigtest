/* eslint-disable @typescript-eslint/no-explicit-any */

import { bigtestGlobals } from '@bigtest/globals';
import { converge } from './converge';
import { makeBuilder } from './builder';
import {
  InteractorOptions,
  ActionMethods,
  LocatorFn,
  InteractorConstructor,
  Interactor,
  Filters,
  Actions,
  FilterParams,
  InteractorSpecification,
  BaseInteractor,
} from './specification';
import { Filter } from './filter';
import { Locator } from './locator';
import { MatchFilter } from './match';
import { formatTable } from './format-table';
import { FilterNotMatchingError } from './errors';
import { interaction, check, Interaction, ReadonlyInteraction } from './interaction';
import { Match } from './match';
import { NoSuchElementError, NotAbsentError, AmbiguousElementError } from './errors';
import { isMatcher } from './matcher';

const defaultLocator: LocatorFn<Element> = (element) => element.textContent || "";
const defaultSelector = 'div';

export function findElements<E extends Element>(parentElement: Element, interactor: InteractorOptions<any, any, any>): E[] {
  if(interactor.specification.selector === ':root') {
    // this is a bit of a hack, because otherwise there isn't a good way of selecting the root element
    return [parentElement.ownerDocument.querySelector(':root') as E];
  } else {
    return Array.from(parentElement.querySelectorAll(interactor.specification.selector || defaultSelector));
  }
}

function findMatches(parentElement: Element, interactor: InteractorOptions<any, any, any>): Match<Element, any>[] {
  return findElements(parentElement, interactor).map((e) => new Match(e, interactor.filter, interactor.locator));
}

function findMatchesMatching(parentElement: Element, interactor: InteractorOptions<any, any, any>): Match<Element, any>[] {
  return findMatches(parentElement, interactor).filter((m) => m.matches);
}

function findMatchesNonEmpty(parentElement: Element, interactor: InteractorOptions<any, any, any>): Match<Element, any>[] {
  let matches = findMatches(parentElement, interactor);
  let matching = matches.filter((m) => m.matches);
  if(matching.length > 0) {
    return matching;
  } else if(matches.length === 0) {
    throw new NoSuchElementError(`did not find ${description(interactor)}`);
  } else {
    let table = formatTable({
      headers: interactor.locator ? [interactor.name, ...interactor.filter.asTableHeader()] : interactor.filter.asTableHeader(),
      rows: matches.slice().sort((a, b) => b.sortWeight - a.sortWeight).map((m) => m.asTableRow()),
    });
    throw new NoSuchElementError(`did not find ${description(interactor)}, did you mean one of:\n\n${table}`);
  }
}

// Given a parent element, and an interactor, find exactly one matching element
// and return it. If no elements match, raise an error. If more than one
// element matches, raise an error.
export function resolveUnique(parentElement: Element, interactor: InteractorOptions<any, any, any>): Element {
  let matching = findMatchesNonEmpty(parentElement, interactor);

  if(matching.length === 1) {
    return matching[0].element;
  } else {
    let alternatives = matching.map((m) => '- ' + m.elementDescription());
    throw new AmbiguousElementError(`${description(interactor)} matches multiple elements:\n\n${alternatives.join('\n')}`);
  }
}

// Given a parent element, and an interactor, find all matching elements and
// return them. If no elements match, raise an error.
export function resolveNonEmpty(parentElement: Element, interactor: InteractorOptions<any, any, any>): Element[] {
  return findMatchesNonEmpty(parentElement, interactor).map(m => m.element);
}

// Given a parent element, and an interactor, check if there are any matching
// elements, and throw an error if there are. Otherwise return undefined.
export function resolveEmpty(parentElement: Element, interactor: InteractorOptions<any, any, any>): void {
  let matching = findMatchesMatching(parentElement, interactor);

  if(matching.length !== 0) {
    let alternatives = matching.map((m) => '- ' + m.elementDescription());
    throw new NotAbsentError(`${description(interactor)} exists but should not:\n\n${alternatives.join('\n')}`);
  }
}

function ownDescription(options: InteractorOptions<any, any, any>): string {
  if(options.locator) {
    return `${options.name} ${options.locator.description} ${options.filter.description}`.trim();
  } else {
    return `${options.name} ${options.filter.description}`.trim();
  }
}

function description(options: InteractorOptions<any, any, any>): string {
  let ancestorsAndSelf: InteractorOptions<any, any, any>[] = options.ancestors.concat(options);
  return ancestorsAndSelf.reverse().map(ownDescription).join(' within ');
}

export function unsafeSyncResolveParent(options: InteractorOptions<any, any, any>): Element {
  return options.ancestors.reduce(resolveUnique, bigtestGlobals.document.documentElement);
}

function unsafeSyncResolveUnique<E extends Element>(options: InteractorOptions<E, any, any>): E {
  return resolveUnique(unsafeSyncResolveParent(options), options) as E;
}

export function instantiateBaseInteractor<E extends Element, F extends Filters<E>, A extends Actions<E>>(
  options: InteractorOptions<E, F, A>,
  resolver: (options: InteractorOptions<E, F, A>) => E
): BaseInteractor<E, FilterParams<E, F>> & ActionMethods<E, A> {
  let interactor = {
    options,

    get description(): string {
      return description(options);
    },

    perform(fn: (element: E) => void): Interaction<void> {
      return interaction(`${description(options)} performs`, async () => {
        if(bigtestGlobals.runnerState === 'assertion') {
          throw new Error(`tried to run perform on ${this.description} in an assertion, perform should only be run in steps`);
        }
        return await converge(() => {
          fn(resolver(options));
        });
      });
    },

    assert(fn: (element: E) => void): Interaction<void> {
      return interaction(`${this.description} asserts`, () => {
        return converge(() => {
          fn(resolver(options));
        });
      });
    },

    has(filters: FilterParams<E, F>): ReadonlyInteraction<void> {
      return interactor.is(filters);
    },

    is(filters: FilterParams<E, F>): ReadonlyInteraction<void> {
      let filter = new Filter(options.specification, filters);
      return check(`${this.description} matches filters: ${filter.description}`, () => {
        return converge(() => {
          let element = resolver(options);
          let match = new MatchFilter(element, filter);
          if(!match.matches) {
            throw new FilterNotMatchingError(`${description(options)} does not match filters:\n\n${match.formatAsExpectations()}`);
          }
        });
      });
    },
  }

  for(let [actionName, action] of Object.entries(options.specification.actions || {})) {
    Object.defineProperty(interactor, actionName, {
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

  return interactor as BaseInteractor<E, FilterParams<E, F>> & ActionMethods<E, A>;
}

export function instantiateInteractor<E extends Element, F extends Filters<E>, A extends Actions<E>>(
  options: InteractorOptions<E, F, A>,
): Interactor<E, FilterParams<E, F>> & ActionMethods<E, A> {
  let interactor = instantiateBaseInteractor(options, unsafeSyncResolveUnique)

  return Object.assign(interactor, {
    find<T extends Interactor<any, any>>(child: T): T {
      return instantiateInteractor({
        ...child.options,
        ancestors: [...options.ancestors, options, ...child.options.ancestors]
      }) as unknown as T;
    },

    exists(): ReadonlyInteraction<void> {
      return check(`${interactor.description} exists`, () => {
        return converge(() => {
          resolveNonEmpty(unsafeSyncResolveParent(options), options);
        });
      });
    },

    absent(): ReadonlyInteraction<void> {
      return check(`${interactor.description} does not exist`, () => {
        return converge(() => {
          resolveEmpty(unsafeSyncResolveParent(options), options);
        });
      });
    }
  });
}

export function createConstructor<E extends Element, FP extends FilterParams<any, any>, AM extends ActionMethods<any, any>>(
  name: string,
  specification: InteractorSpecification<E, any, any>,
): InteractorConstructor<E, FP, AM> {
  function initInteractor(...args: any[]) {
    let locator, filter;
    if(typeof(args[0]) === 'string' || isMatcher(args[0])) {
      locator = new Locator(specification.locator || defaultLocator, args[0]);
      filter = new Filter(specification, args[1] || {});
    } else {
      filter = new Filter(specification, args[0] || {});
    }
    return instantiateInteractor({ name, specification, filter, locator, ancestors: [] });
  }

  return makeBuilder(initInteractor, name, specification) as unknown as InteractorConstructor<E, FP, AM>;
}

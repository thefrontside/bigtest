import { Interactor } from './interactor';
import { Interaction } from './interaction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionFn<E extends Element> = (element: E, ...args: any[]) => unknown;

export type LocatorFn<E extends Element> = (element: E) => string;

export type FilterFn<T, E extends Element> = (element: E) => T;

export interface FilterObject<T, E extends Element> {
  apply: FilterFn<T, E>;
  default?: T;
}

export type FilterDefinition<T, E extends Element> = FilterFn<T, E> | FilterObject<T, E>;

export type LocatorSpecification<E extends Element> = Record<string, LocatorFn<E>>;

export type FilterSpecification<E extends Element> = Record<string, FilterDefinition<unknown, E>>;

export type ActionSpecification<E extends Element> = Record<string, ActionFn<E>>;

export interface InteractorSpecification<E extends Element> {
  selector?: string;
  defaultLocator?: LocatorFn<E>;
  locators?: LocatorSpecification<E>;
  actions?: ActionSpecification<E>;
  filters?: FilterSpecification<E>;
}

export type ActionImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['actions']]: S['actions'][P] extends ((element: E, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Interaction<TReturn>) : never;
}

export type FilterImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['filters']]?: S['filters'][P] extends FilterDefinition<infer TArg, E> ? TArg : never;
}

export type LocatorImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['locators']]: (value: string, filters?: FilterImplementation<E, S>) => InteractorInstance<E, S>
}

export type InteractorInstance<E extends Element, S extends InteractorSpecification<E>> = Interactor<E, S> & ActionImplementation<E, S>;

export type InteractorType<E extends Element, S extends InteractorSpecification<E>> =
  ((value: string, filters?: FilterImplementation<E, S>) => InteractorInstance<E, S>) &
  LocatorImplementation<E, S>;

import { Interactor } from './interactor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionFn<E extends Element, S extends InteractorSpecification<E>> = (interactor: InteractorInstance<E, S>, ...args: any[]) => unknown;

export type LocatorFn<E extends Element> = (element: E) => string;

export type NullLocatorFn = () => null;

export type FilterFn<T, E extends Element> = (element: E) => T;

export interface FilterObject<T, E extends Element> {
  apply: FilterFn<T, E>;
  default?: T;
}

export type LocatorSpecification<E extends Element> = Record<string, LocatorFn<E>>;

export type FilterSpecification<E extends Element> = Record<string, FilterFn<unknown, E> | FilterObject<unknown, E>>

export type ActionSpecification<E extends Element, S extends InteractorSpecification<E>> = Record<string, ActionFn<E, S>>;

export interface InteractorSpecification<E extends Element> {
  selector?: string;
  defaultLocator?: LocatorFn<E>;
  locators?: LocatorSpecification<E>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions?: ActionSpecification<E, any>;
  filters?: FilterSpecification<E>;
}

export type ActionImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['actions']]: S['actions'][P] extends ((interactor: InteractorInstance<E, S>, ...args: infer TArgs) => infer TReturn)
    ? ((...args: TArgs) => TReturn)
    : never;
}

export type FilterImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['filters']]?:
    S['filters'][P] extends FilterFn<infer TArg, E> ?
    TArg :
    S['filters'][P] extends FilterObject<infer TArg, E> ?
    TArg :
    never;
}

export type LocatorImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['locators']]: (value: string, filters?: FilterImplementation<E, S>) => InteractorInstance<E, S>
}

export type InteractorInstance<E extends Element, S extends InteractorSpecification<E>> = Interactor<E, S> & ActionImplementation<E, S>;

export type InteractorConstructor<E extends Element, S extends InteractorSpecification<E>> =
  (value?: string, filters?: FilterImplementation<E, S>) => InteractorInstance<E, S>;

export type InteractorType<E extends Element, S extends InteractorSpecification<E>> = InteractorConstructor<E, S> & LocatorImplementation<E, S>;

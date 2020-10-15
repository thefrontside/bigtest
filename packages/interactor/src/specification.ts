/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interactor } from './interactor';

export type ActionFn<E extends Element> = (interactor: InteractorInstance<E, {}, {}, {}>, ...args: any[]) => unknown;

export type FilterFn<T, E extends Element> = (element: E) => T;

export type LocatorFn<E extends Element> = (element: E) => string;

export type FilterObject<T, E extends Element> = {
  apply: FilterFn<T, E>;
  default?: T;
}

export type Filters<E extends Element> = Record<string, FilterFn<unknown, E> | FilterObject<unknown, E>>

export type Actions<E extends Element> = Record<string, ActionFn<E>>;

export type Children = Record<string, InteractorConstructor<any, any, any, any>>;

export type InteractorSpecification<E extends Element, F extends Filters<E>, A extends Actions<E>, C extends Children> = {
  selector?: string;
  actions?: A;
  filters?: F;
  children?: C;
  locator?: LocatorFn<E>;
}

export type ActionMethods<E extends Element, A extends Actions<E>> = {
  [P in keyof A]: A[P] extends ((interactor: InteractorInstance<E, {}, {}, {}>, ...args: infer TArgs) => infer TReturn)
    ? ((...args: TArgs) => TReturn)
    : never;
}

export type ChildrenMethods<C extends Children> = {
  [P in keyof C]: C[P];
}

export type FilterParams<E extends Element, F extends Filters<E>> = keyof F extends never ? never : {
  [P in keyof F]?:
    F[P] extends FilterFn<infer TArg, E> ?
    TArg :
    F[P] extends FilterObject<infer TArg, E> ?
    TArg :
    never;
}

export interface InteractorConstructor<E extends Element, F extends Filters<E>, A extends Actions<E>, C extends Children> {
  (value: string, filters?: FilterParams<E, F>): InteractorInstance<E, F, A, C>;
  (filters?: FilterParams<E, F>): InteractorInstance<E, F, A, C>;
}

export type InteractorInstance<E extends Element, F extends Filters<E>, A extends Actions<E>, C extends Children> = Interactor<E, F, A, C> & ActionMethods<E, A> & ChildrenMethods<C>;

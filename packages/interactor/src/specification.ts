/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interactor } from './interactor';
import { Interaction } from './interaction';

export type ActionFn<E extends Element> = (interactor: InteractorInstance<E, {}, {}>, ...args: any[]) => Promise<unknown>;

export type FilterFn<T, E extends Element> = (element: E) => T;

export type LocatorFn<E extends Element> = (element: E) => string;

export type FilterObject<T, E extends Element> = {
  apply: FilterFn<T, E>;
  default?: T;
}

export type Filters<E extends Element> = Record<string, FilterFn<unknown, E> | FilterObject<unknown, E>>

export type Actions<E extends Element> = Record<string, ActionFn<E>>;

export type InteractorSpecification<E extends Element, F extends Filters<E>, A extends Actions<E>> = {
  selector?: string;
  actions?: A;
  filters?: F;
  locator?: LocatorFn<E>;
}

export type ActionMethods<E extends Element, A extends Actions<E>> = {
  [P in keyof A]: A[P] extends ((interactor: InteractorInstance<E, {}, {}>, ...args: infer TArgs) => Promise<infer TReturn>)
    ? ((...args: TArgs) => Interaction<TReturn>)
    : never;
}

export type FilterParams<E extends Element, F extends Filters<E>> = keyof F extends never ? never : {
  [P in keyof F]?:
    F[P] extends FilterFn<infer TArg, E> ?
    TArg :
    F[P] extends FilterObject<infer TArg, E> ?
    TArg :
    never;
}

export type InteractorInstance<E extends Element, F extends Filters<E>, A extends Actions<E>> = Interactor<E, F, A> & ActionMethods<E, A>;

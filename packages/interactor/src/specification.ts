/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interactor } from './interactor';
import { Interaction } from './interaction';

export type ActionFn<E extends Element> = (interactor: InteractorInstance<E, {}, {}>, ...args: any[]) => Promise<unknown>;

export type FilterFn<T, E extends Element> = (element: E) => T;

/**
 * A function which given an element returns a string which can be used to
 * locate the element, for example by returning the elements text content, or
 * an attribute value.
 *
 * ### Example
 *
 * ``` typescript
 * const inputValue: LocatorFn<HTMLInputElement> = (element) => element.value;
 * ```
 *
 * @param element The element to extract a locator out of
 * @typeParam E The type of the element that the locator function operates on
 */
export type LocatorFn<E extends Element> = (element: E) => string;

export type FilterObject<T, E extends Element> = {
  apply: FilterFn<T, E>;
  default?: T;
}

export type Filters<E extends Element> = Record<string, FilterFn<unknown, E> | FilterObject<unknown, E>>

export type Actions<E extends Element> = Record<string, ActionFn<E>>;

export type InteractorSpecification<E extends Element, F extends Filters<E>, A extends Actions<E>> = {
  /**
   * The CSS selector that this interactor uses to find matching elements
   */
  selector?: string;
  actions?: A;
  filters?: F;
  /**
   * A function which returns a string value for a matched element, which can
   * be used to locate a specific instance of this interactor. The `value`
   * parameter of an {@link InteractorConstructor} must match the value
   * returned from the locator function.
   */
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

export interface InteractorConstructor<E extends Element, F extends Filters<E>, A extends Actions<E>> {
  (filters?: FilterParams<E, F>): InteractorInstance<E, F, A>;
  (value: string, filters?: FilterParams<E, F>): InteractorInstance<E, F, A>;
}

/**
 * When calling {@link createInteractor}, this is the intermediate object that
 * is returned. See {@link InteractorSpecification} for a detailed list of all
 * available options.
 *
 * @typeParam E The type of DOM Element that this interactor operates on. By specifying the element type, actions and filters defined for the interactor can be type checked against the actual element type.
 */
export interface InteractorBuilder<E extends Element> {
  /**
   * Calling the builder will create an interactor.
   *
   * @param specification The specification of this interactor
   * @typeParam F the filters of this interactor, this is usually inferred from the specification
   * @typeParam A the actions of this interactor, this is usually inferred from the specification
   */
  <F extends Filters<E> = {}, A extends Actions<E> = {}>(specification: InteractorSpecification<E, F, A>): InteractorConstructor<E, F, A>;
}

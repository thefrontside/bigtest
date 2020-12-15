/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interactor } from './interactor';
import { Interaction } from './interaction';

/** @internal */
export type ActionFn<E extends Element> = (interactor: InteractorInstance<E, {}, {}>, ...args: any[]) => Promise<unknown>;

/** @internal */
export type FilterFn<T, E extends Element> = (element: E) => T;

/**
 * A function which given an element returns a string which can be used to
 * locate the element, for example by returning the elements text content, or
 * an attribute value.
 *
 * #### Example
 *
 * ``` typescript
 * const inputValue: LocatorFn<HTMLInputElement> = (element) => element.value;
 * ```
 *
 * @param element The element to extract a locator out of
 * @typeParam E The type of the element that the locator function operates on
 */
export type LocatorFn<E extends Element> = (element: E) => string;

/** @internal */
export type FilterObject<T, E extends Element> = {
  apply: FilterFn<T, E>;
  default?: T;
}

/** @internal */
export type Filters<E extends Element> = Record<string, FilterFn<unknown, E> | FilterObject<unknown, E>>

/** @internal */
export type Actions<E extends Element> = Record<string, ActionFn<E>>;

/** @internal */
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

/** @internal */
export type ActionMethods<E extends Element, A extends Actions<E>> = {
  [P in keyof A]: A[P] extends ((interactor: InteractorInstance<E, {}, {}>, ...args: infer TArgs) => Promise<infer TReturn>)
    ? ((...args: TArgs) => Interaction<TReturn>)
    : never;
}

/** @internal */
export type FilterParams<E extends Element, F extends Filters<E>> = keyof F extends never ? never : {
  [P in keyof F]?:
    F[P] extends FilterFn<infer TArg, E> ?
    TArg :
    F[P] extends FilterObject<infer TArg, E> ?
    TArg :
    never;
}

/** @internal */
export type InteractorInstance<E extends Element, F extends Filters<E>, A extends Actions<E>> = Interactor<E, F, A> & ActionMethods<E, A>;

/**
 * An interactor constructor is a function which can be used to initialize an
 * {@link Interactor}. When calling {@link createInteractor}, you will get
 * back an interactor constructor.
 *
 * The constructor can be called with a locator value, and an object of
 * filters. Both are optional, and can be omitted.
 *
 * @typeParam E The type of DOM Element that this interactor operates on.
 * @typeParam F the filters of this interactor, this is usually inferred from the specification
 * @typeParam A the actions of this interactor, this is usually inferred from the specification
 */
export interface InteractorConstructor<E extends Element, F extends Filters<E>, A extends Actions<E>> {
  /**
   * The constructor can be called with filters only:
   *
   * ``` typescript
   * Link({ id: 'home-link', href: '/' });
   * ```
   *
   * Or with no arguments, this can be especially useful when finding a nested element.
   *
   * ```
   * ListItem('JavaScript').find(Link()).click(); // click the only link within a specific list item
   * ```
   *
   * @param filters An object describing a set of filters to apply, which should match the value of applying the filters defined in the {@link InteractorSpecification} to the element.
   */
  (filters?: FilterParams<E, F>): InteractorInstance<E, F, A>;
  /**
   * The constructor can be called with a locator:
   *
   * ``` typescript
   * Link('Home');
   * ```
   *
   * Or with a locator and options:
   *
   * ``` typescript
   * Link('Home', { href: '/' });
   * ```
   *
   * @param value The locator value, which should match the value of applying the locator function defined in the {@link InteractorSpecification} to the element.
   * @param filters An object describing a set of filters to apply, which should match the value of applying the filters defined in the {@link InteractorSpecification} to the element.
   */
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Filter } from './filter';
import { Locator } from './locator';
import { Interaction, ReadonlyInteraction } from './interaction';
import { MergeObjects } from './merge-objects';
import { MaybeMatcher } from './matcher';

export type EmptyObject = Record<never, never>;

export interface ToFilter<T> {
  toFilter(): (element: Element) => T
}

export interface ExistsAssertionsImplementation {

  /**
   * An assertion which checks that an element matching the interactor exists.
   * Throws an error if the element does not exist.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').exists();
   * ```
   */
  exists(): ReadonlyInteraction<void> & ToFilter<boolean>;

  /**
   * An assertion which checks that an element matching the interactor does not
   * exist. Throws an error if the element exists.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').absent();
   * ```
   */
  absent(): ReadonlyInteraction<void> & ToFilter<boolean>;
}

export interface BaseInteractor<E extends Element, F extends FilterParams<any, any>> {
  /**
   * @hidden
   */
  options: InteractorOptions<E, any, any>;

  /**
   * @returns a human readable description of this interactor
   */
  description: string;

  /**
   * Perform a one-off action on the given interactor. Takes a function which
   * receives an element. This function converges, which means that it is rerun
   * in a loop until it does not throw an error or times out.
   *
   * We recommend using this function for debugging only. You should normally
   * define an action in an {@link InteractorSpecification}.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').perform((e) => e.click());
   * ```
   */
  perform(fn: (element: E) => void): Interaction<void>;

  /**
   * Perform a one-off assertion on the given interactor. Takes a function which
   * receives an element. This function converges, which means that it is rerun
   * in a loop until it does not throw an error or times out.
   *
   * We recommend using this function for debugging only. You should normally
   * define a filter in an {@link InteractorSpecification}.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Next').assert((e) => assert(e.tagName === 'A'));
   * ```
   */
  assert(fn: (element: E) => void): Interaction<void>;

  /**
   * Checks that there is one element matching the interactor, and that this
   * element matches the given filters. The available filters are defined by
   * the {@link InteractorSpecification}.
   *
   * ## Example
   *
   * ``` typescript
   * await Link('Home').has({ href: '/' })
   * ```
   */
  has(filters: F): ReadonlyInteraction<void>;

  /**
   * Identical to {@link has}, but reads better with some filters.
   *
   * ## Example
   *
   * ``` typescript
   * await CheckBox('Accept conditions').is({ checked: true })
   * ```
   */
  is(filters: F): ReadonlyInteraction<void>;
}

/**
 * Instances of an interactor returned by an {@link InteractorConstructor}, use
 * this class as its base. They are also extended with any additional actions
 * defined in their {@link InteractorSpecification}.
 */
export interface Interactor<E extends Element, F extends FilterParams<any, any>> extends BaseInteractor<E, F>, ExistsAssertionsImplementation {
  /**
   * Returns a copy of the given interactor which is scoped to this interactor.
   * When there are multiple matches for an interactor, this makes it possible
   * to make them more specific by limiting the interactor to a section of the
   * page.
   *
   * ## Example
   *
   * ``` typescript
   * await Fieldset('Owner').find(TextField('Name')).fillIn('Jonas');
   * await Fieldset('Brand').find(TextField('Name')).fillIn('Volkswagen');
   * ```
   * @param interactor the interactor which should be scoped
   * @returns a scoped copy of the initial interactor
   * @typeParam T the type of the interactor that we are going to scope
   */
   find<T extends Interactor<any, any>>(interactor: T): T;
}

export type ActionFn<E extends Element> = (interactor: Interactor<E, EmptyObject>, ...args: any[]) => Promise<unknown>;
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

export type Filters<E extends Element> = Record<string, FilterFn<unknown, E> | FilterObject<unknown, E> | ToFilter<unknown>>

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
  [P in keyof A]: A[P] extends ((interactor: Interactor<E, EmptyObject>, ...args: infer TArgs) => Promise<infer TReturn>)
    ? ((...args: TArgs) => Interaction<TReturn>)
    : never;
}

export type FilterMethods<E extends Element, F extends Filters<E>> = {
  [P in keyof F]:
    F[P] extends ToFilter<infer TReturn> ? (() => Interaction<TReturn> & ToFilter<TReturn>) :
    F[P] extends FilterFn<infer TReturn, any> ? (() => Interaction<TReturn> & ToFilter<TReturn>) :
    F[P] extends FilterObject<infer TReturn, any> ? (() => Interaction<TReturn> & ToFilter<TReturn>) :
    never;
}

export type FilterReturn<F> = {
  [P in keyof F]?: F[P] extends MaybeMatcher<infer T> ? T : never;
}

export type FilterParams<E extends Element, F extends Filters<E>> = keyof F extends never ? never : {
  [P in keyof F]?:
    F[P] extends ToFilter<infer TArg> ? MaybeMatcher<TArg> :
    F[P] extends FilterFn<infer TArg, E> ? MaybeMatcher<TArg> :
    F[P] extends FilterObject<infer TArg, E> ? MaybeMatcher<TArg> :
    never;
}

export interface InteractorBuilder<E extends Element, FP extends FilterParams<any, any>, FM extends FilterMethods<any, any>, AM extends ActionMethods<any, any>> {
  selector(value: string): InteractorConstructor<E, FP, FM, AM>;
  locator(value: LocatorFn<E>): InteractorConstructor<E, FP, FM, AM>;
  filters<FR extends Filters<E>>(filters: FR): InteractorConstructor<E, MergeObjects<FP, FilterParams<E, FR>>, MergeObjects<FM, FilterMethods<E, FR>>, AM>;
  actions<AR extends Actions<E>>(actions: AR): InteractorConstructor<E, FP, FM, MergeObjects<AM, ActionMethods<E, AR>>>;
  extend<ER extends E = E>(name: string): InteractorConstructor<ER, FP, FM, AM>;
}

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
export interface InteractorConstructor<E extends Element, FP extends FilterParams<any, any>, FM extends FilterMethods<any, any>, AM extends ActionMethods<any, any>> extends InteractorBuilder<E, FP, FM, AM> {
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
  (filters?: FP): Interactor<E, FP> & FM & AM;
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
  (value: MaybeMatcher<string>, filters?: FP): Interactor<E, FP> & FM & AM;
}

/**
 * When calling {@link createInteractor}, this is the intermediate object that
 * is returned. See {@link InteractorSpecification} for a detailed list of all
 * available options.
 *
 * @typeParam E The type of DOM Element that this interactor operates on. By specifying the element type, actions and filters defined for the interactor can be type checked against the actual element type.
 */
export interface InteractorSpecificationBuilder<E extends Element> extends InteractorBuilder<E, EmptyObject, EmptyObject, EmptyObject> {
  /**
   * Calling the builder will create an interactor.
   *
   * @param specification The specification of this interactor
   * @typeParam F the filters of this interactor, this is usually inferred from the specification
   * @typeParam A the actions of this interactor, this is usually inferred from the specification
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  <F extends Filters<E> = EmptyObject, A extends Actions<E> = EmptyObject>(specification: InteractorSpecification<E, F, A>): InteractorConstructor<E, FilterParams<E, F>, FilterMethods<E, F>, ActionMethods<E, A>>;
}

export type InteractorOptions<E extends Element, F extends Filters<E>, A extends Actions<E>> = {
  name: string;
  specification: InteractorSpecification<E, F, A>;
  locator?: Locator<E>;
  filter: Filter<E, F>;
  ancestors: InteractorOptions<any, any, any>[];
};

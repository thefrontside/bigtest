import { Interactor } from './interactor';
import { Interaction } from './interaction';

export type ActionFn<E extends Element> = (element: E) => unknown;

export type LocatorFn<E extends Element> = (element: E) => string;

export type LocatorSpecification<E extends Element> = Record<string, LocatorFn<E>>;

export type ActionSpecification<E extends Element> = Record<string, ActionFn<E>>;

export interface InteractorSpecification<E extends Element, L extends LocatorSpecification<E>, A extends ActionSpecification<E>> {
  selector: string;
  defaultLocator: LocatorFn<E>;
  locators: L;
  actions: A;
}

export type ActionImplementation<E extends Element, A extends ActionSpecification<E>, S extends InteractorSpecification<E, {}, A>> = {
  [P in keyof S['actions']]: S['actions'][P] extends ((element: E, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Interaction<TReturn>) : never;
}

export type LocatorImplementation<E extends Element, L extends LocatorSpecification<E>, A extends ActionSpecification<E>, S extends InteractorSpecification<E, L, A>> = {
  [P in keyof S['locators']]: (value: string) => InteractorInstance<E, A>;
}

export type InteractorInstance<E extends Element, A extends ActionSpecification<E>> = Interactor<E, InteractorSpecification<E, {}, A>> & ActionImplementation<E, A, InteractorSpecification<E, {}, A>>;

export type InteractorType<E extends Element, L extends LocatorSpecification<E>, A extends ActionSpecification<E>> =
  ((value: string) => InteractorInstance<E, A>) &
  LocatorImplementation<E, L, A, InteractorSpecification<E, L, A>>;

export const defaultSpecification: InteractorSpecification<Element, {}, {}> = {
  selector: 'div',
  defaultLocator: (element) => element.textContent || "",
  locators: {},
  actions: {},
}

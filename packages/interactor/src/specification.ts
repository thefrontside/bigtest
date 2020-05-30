import { Interactor } from './interactor';
import { Interaction } from './interaction';

export type ActionFn<E extends Element> = (element: E) => unknown;

export type LocatorFn<E extends Element> = (element: E) => string;

export type LocatorSpecification<E extends Element> = Record<string, LocatorFn<E>>;

export type ActionSpecification<E extends Element> = Record<string, ActionFn<E>>;

export interface InteractorSpecification<E extends Element> {
  selector: string;
  defaultLocator: LocatorFn<E>;
  locators: LocatorSpecification<E>;
  actions: ActionSpecification<E>;
}

export type ActionImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['actions']]: S['actions'][P] extends ((element: E, ...args: infer TArgs) => infer TReturn) ? ((...args: TArgs) => Interaction<TReturn>) : never;
}

export type LocatorImplementation<E extends Element, S extends InteractorSpecification<E>> = {
  [P in keyof S['locators']]: (value: string) => InteractorInstance<E, S>
}

export type InteractorInstance<E extends Element, S extends InteractorSpecification<E>> = Interactor & ActionImplementation<E, S>;

export type InteractorType<E extends Element, S extends InteractorSpecification<E>> =
  ((value: string) => InteractorInstance<E, S>) &
  LocatorImplementation<E, S>;

export const defaultSpecification: InteractorSpecification<Element> = {
  selector: 'div',
  defaultLocator: (element) => element.textContent || "",
  locators: {},
  actions: {},
}

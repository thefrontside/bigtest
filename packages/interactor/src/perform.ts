import { Interactor } from "./interactor";
import { Filters, Actions } from "./specification";

export function perform<E extends Element, F extends Filters<E>, A extends Actions<E>, T extends unknown[]>(fn: (element: E, ...args: T) => void) {
  return async (interactor: Interactor<E, F, A>, ...args: T) => {
    return await interactor.perform(element => {
      fn(element, ...args);
    });
  };
}

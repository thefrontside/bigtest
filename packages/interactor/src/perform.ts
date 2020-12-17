import { Interactor, FiltersImplementation } from "./specification";

export function perform<E extends Element, F extends FiltersImplementation, T extends unknown[]>(fn: (element: E, ...args: T) => void) {
  return async (interactor: Interactor<E, F>, ...args: T) => {
    return await interactor.perform(element => {
      fn(element, ...args);
    });
  };
}

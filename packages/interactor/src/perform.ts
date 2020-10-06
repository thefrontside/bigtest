import { Interactor } from "./interactor";
import { Filters, Actions } from "./specification";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function perform<E extends Element, F extends Filters<E>, A extends Actions<E>, T extends any[]>(fn: (element: E, ...args: T) => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (interactor: Interactor<E, F, A>, ...args: T) => interactor.perform(element => {
    fn(element, ...args);
  });
}

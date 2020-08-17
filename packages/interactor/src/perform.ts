import { Interactor } from "./interactor";
import { InteractorSpecification } from "./specification";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function perform<E extends Element, S extends InteractorSpecification<E>, A extends any[]>(fn: (element: E, ...args: A) => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (interactor: Interactor<E, S>, ...args: A) => interactor.perform(element => {
    fn(element, ...args);
  });
}

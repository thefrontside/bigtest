/* eslint-disable @typescript-eslint/no-explicit-any */
import { Interactor, FilterParams } from './specification';

export function perform<E extends Element, F extends FilterParams<any, any>, T extends unknown[]>(fn: (element: E, ...args: T) => void): (interactor: Interactor<E, F>, ...args: T) => Promise<void> {
  console.warn('`perform` is deprecated, please use `({ perform }) => perform(...)` instead!');
  return async (interactor: Interactor<E, F>, ...args: T) => {
    return await interactor.perform(element => {
      fn(element, ...args);
    });
  };
}

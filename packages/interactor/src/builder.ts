/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filters, Actions, LocatorFn, InteractorBuilder, InteractorSpecification, InteractorConstructor, FilterParams, ActionMethods } from './specification';
import { createConstructor } from './constructor';
import { MergeObjects } from './merge-objects';

export function makeBuilder<T, E extends Element, FP extends FilterParams<any, any>, AM extends ActionMethods<any, any>>(base: T, name: string, specification: InteractorSpecification<E, any, any>): T & InteractorBuilder<E, FP, AM> {
  return Object.assign(base, {
    selector: (value: string): InteractorConstructor<E, FP, AM> => {
      return createConstructor(name, { ...specification, selector: value });
    },
    locator: (value: LocatorFn<E>): InteractorConstructor<E, FP, AM> => {
      return createConstructor(name, { ...specification, locator: value });
    },
    filters: <FR extends Filters<E>>(filters: FR): InteractorConstructor<E, MergeObjects<FP, FilterParams<E, FR>>, AM> => {
      return createConstructor(name, { ...specification, filters: { ...specification.filters, ...filters } });
    },
    actions: <AR extends Actions<E>>(actions: AR): InteractorConstructor<E, FP, MergeObjects<AM, ActionMethods<E, AR>>> => {
      return createConstructor(name, { ...specification, actions: Object.assign({}, specification.actions, actions) });
    },
    extend: <ER extends Element = E>(newName: string): InteractorConstructor<ER, FP, AM> => {
      return createConstructor(newName, specification) as unknown as InteractorConstructor<ER, FP, AM>;
    },
  });
}

import { Filters, Actions, LocatorFn, InteractorBuilder, InteractorSpecification, InteractorConstructor } from './specification';
import { createConstructor } from './constructor';

export function makeBuilder<T, E extends Element, F extends Filters<E>, A extends Actions<E>>(base: T, name: string, specification: InteractorSpecification<E, F, A>): T & InteractorBuilder<E, F, A> {
  return Object.assign(base, {
    selector: (value: string): InteractorConstructor<E, F, A> => {
      return createConstructor(name, { ...specification, selector: value });
    },
    locator: (value: LocatorFn<E>): InteractorConstructor<E, F, A> => {
      return createConstructor(name, { ...specification, locator: value });
    },
    filters: <FR extends Filters<E>>(filters: FR): InteractorConstructor<E, F & FR, A> => {
      return createConstructor(name, { ...specification, filters: { ...specification.filters, ...filters } });
    },
    actions: <AR extends Actions<E>>(actions: AR): InteractorConstructor<E, F, A & AR> => {
      return createConstructor(name, { ...specification, actions: Object.assign({}, specification.actions, actions) });
    },
  });
}

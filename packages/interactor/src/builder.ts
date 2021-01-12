import { Filters, Actions, InteractorBuilder } from './specification';

export function makeBuilder<T, E extends Element, F extends Filters<E>, A extends Actions<E>>(base: T): T & InteractorBuilder<E, F, A> {
  return Object.assign(base, {
    selector: () => { throw new Error('not implemented') },
    filters: () => { throw new Error('not implemented') },
    actions: () => { throw new Error('not implemented') },
  });
}

import { bigtestGlobals } from "@bigtest/globals";
import { converge } from "./converge";
import { interaction } from "./interaction";
import { unsafeSyncResolveUnique } from './constructor'
import { EmptyObject, FilterReturn, Interactor } from "./specification";

export const read = <E extends Element, F extends EmptyObject>(interactor: Interactor<E, F>, field: keyof F): Promise<FilterReturn<F>> => {
  let filter = interactor.options.specification.filters?.[field]
  return interaction(`get ${field} from ${interactor.description}`, async () => {
    if(bigtestGlobals.runnerState === 'assertion') {
      throw new Error(`tried to get ${field} from ${interactor.description} in an assertion, getters should only be used in steps`);
    }
    let filterFn = typeof(filter) === 'function' ? filter : filter.apply
    return await converge(() => filterFn(unsafeSyncResolveUnique(interactor.options)));
  });
}

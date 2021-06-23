/* eslint-disable @typescript-eslint/no-explicit-any */

import { instantiateBaseInteractor, findElements, unsafeSyncResolveParent } from "./constructor";
import { BaseInteractor, Filters, InteractorConstructor, FilterParams } from "./specification";

type GetElement<I extends InteractorConstructor<any, any, any, any>> = I extends InteractorConstructor<infer E, any, any, any> ? E : never
type GetFilters<I extends InteractorConstructor<any, any, any, any>> = I extends InteractorConstructor<any, infer F, any, any> ? F : never
type GetActions<I extends InteractorConstructor<any, any, any, any>> = I extends InteractorConstructor<any, any, any, infer A> ? A : never

export interface InteractorInspector<E extends Element, FP extends FilterParams<any, any>> extends BaseInteractor<E, FP> {
  element: E,
  find<T extends InteractorConstructor<any, any, any, any>>(interactor: T): Inspector<T>
}

export interface Inspector<C extends InteractorConstructor<any, any, any, any>> {
  /**
   * Finds all matched by selector elements and wraps each of them to intreactor
   */
   all(): (InteractorInspector<GetElement<C>, GetFilters<C>> & GetActions<C>)[]
}

export function createInspector<IC extends InteractorConstructor<any, any, any, any>>(
  constructor: IC,
  parentElement?: Element
): Inspector<IC> {
  // NOTE: Wait for https://github.com/thefrontside/bigtest/pull/895 to use specification instead
  let options = constructor().options as ReturnType<IC>['options']
  return {
    all() {
      let elements = findElements<GetElement<IC>>(parentElement ?? unsafeSyncResolveParent(options), options);
      return elements.map(
        element => (Object.assign(
          instantiateBaseInteractor(options, () => element) as (BaseInteractor<GetElement<IC>, Filters<GetFilters<IC>>> & GetActions<IC>), {
          element,
          find<T extends InteractorConstructor<any, any, any, any>>(constructor: T): Inspector<T> {
            return createInspector(constructor, element)
          }
        }))
      );
    }
  };
}

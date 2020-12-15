import { performance } from '@bigtest/performance';
import { bigtestGlobals } from '@bigtest/globals';

/** @internal */
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @internal */
export async function converge<T>(fn: () => T): Promise<T> {
  let startTime = performance.now();
  while(true) {
    try {
      return fn();
    } catch(e) {
      let diff = performance.now() - startTime;
      if(diff > bigtestGlobals.defaultInteractorTimeout) {
        throw e;
      } else {
        await wait(1);
      }
    }
  }
}

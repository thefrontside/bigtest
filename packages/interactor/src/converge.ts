import { main, timeout as effectionTimeout } from 'effection';

// TODO: this API is available on browsers as `window.performance`, we need to figure out
// a way to package this so it'll work on both browsers and node.
import { performance } from 'perf_hooks';

export async function converge<T>(timeout: number, fn: () => T): Promise<T> {
  return await main(function*() {
    let startTime = performance.now();
    while(true) {
      try {
        return fn();
      } catch(e) {
        let diff = performance.now() - startTime;
        if(diff > timeout) {
          throw e;
        } else {
          yield effectionTimeout(1);
        }
      }
    }
  });
}

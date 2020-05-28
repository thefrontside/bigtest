import { main, timeout as effectionTimeout } from 'effection';

const win: { performance?: unknown } = (typeof(window) === 'object') ? window : {};
const performance = (typeof(win.performance) === 'object') ? win.performance : require('perf_hooks').performance;

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

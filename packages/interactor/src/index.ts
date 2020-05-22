import { main, timeout as effectionTimeout } from 'effection';

// TODO: this API is available on browsers as `window.performance`, we need to figure out
// a way to package this so it'll work on both browsers and node.
import { performance } from 'perf_hooks';

interface Options {
  timeout: number,
  document?: HTMLDocument
}

let defaultOptions: Options = {
  timeout: 1900
}

async function converge<T>(timeout: number, fn: () => T): Promise<T> {
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

export interface InteractorSpecification {
  name: string,
  selector: string,
  defaultLocator: (element: HTMLElement) => string;
}

export type LocatorSpecification = string;

export class Interactor {
  constructor(private specification: InteractorSpecification, private locator: LocatorSpecification) {
  }

  async exists(): Promise<true> {
    return converge(defaultOptions.timeout, () => {
      if(!defaultOptions.document) {
        throw new Error('must specify document');
      }
      let elements = defaultOptions.document.querySelectorAll(this.specification.selector);

      let matchingElements = [].filter.call(elements, (element) => {
        return this.specification.defaultLocator(element) === this.locator
      });

      if(matchingElements.length === 1) {
        return true;
      } else if(matchingElements.length === 0) {
        throw new Error(`${this.specification.name} ${JSON.stringify(this.locator)} does not exist`);
      } else {
        throw new Error(`${this.specification.name} ${JSON.stringify(this.locator)} is ambiguous`);
      }
    });
  }
}

export function interactor(specification: InteractorSpecification): (locator: LocatorSpecification) => Interactor {
  return function(locator: LocatorSpecification) {
    return new Interactor(specification, locator);
  }
}

export function setDefaultOptions(options: Partial<Options>) {
  Object.assign(defaultOptions, options);
}

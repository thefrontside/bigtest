import { converge } from './converge';

interface Options {
  timeout: number,
  document?: HTMLDocument
}

let defaultOptions: Options = {
  timeout: 1900
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

export class SelectorError extends Error {
  name = 'SelectorError';
}

export function throwIfEmpty<T extends Iterable<any>>(collection: T, message: string): T {
  if (Array.from(collection).length === 0) {
    throw new SelectorError(message);
  }
  return collection;
}

export function compact<T>(arr: Array<T | null>): Array<T> {
  return arr.reduce((memo, item) => {
    if (item == null) return memo;
    return memo.concat([item]);
  }, [] as Array<T>);
}

export function isHTMLElement(elem: any): elem is HTMLElement {
  return typeof elem.click === 'function';
}

export function isHTMLInputElement(elem: any): elem is HTMLInputElement {
  return typeof elem.value === 'string';
}

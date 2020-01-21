export class SelectorError extends Error {
  name = 'SelectorError';
}

export function throwIfEmpty<T extends Iterable<any>>(collection: T, message: string): T {
  if (Array.from(collection).length == 0) throw new SelectorError(message);
  return collection;
}

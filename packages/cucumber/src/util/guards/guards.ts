export const isFunction = (x: unknown): x is Function => typeof x === 'function';

export const isObject = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === 'object';

export const isPromise = <T>(x: unknown): x is PromiseLike<T> => {
  return isObject(x) && isFunction(x.then);
};

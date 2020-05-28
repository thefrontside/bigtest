export interface Interaction<T> extends Promise<T> {
  description: string;
}

export function interaction<T>(description: string, fn: () => Promise<T>): Interaction<T> {
  let promise: Promise<T>;
  return {
    description,
    [Symbol.toStringTag]: `[interaction ${description}]`,
    then(onFulfill, onReject) {
      if(!promise) { promise = fn(); }
      return promise.then(onFulfill, onReject);
    },
    catch(onReject) {
      if(!promise) { promise = fn(); }
      return promise.catch(onReject);
    },
    finally(handler) {
      if(!promise) { promise = fn(); }
      return promise.finally(handler);
    }
  }
}

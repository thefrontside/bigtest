export interface Interaction<T> extends Promise<T> {
  description: string;
  action: () => Promise<T>;
}

export interface ReadonlyInteraction<T> extends Interaction<T> {
  check: () => Promise<T>;
}

export function interaction<T>(description: string, action: () => Promise<T>): Interaction<T> {
  let promise: Promise<T>;
  return {
    description,
    action,
    [Symbol.toStringTag]: `[interaction ${description}]`,
    then(onFulfill, onReject) {
      if(!promise) { promise = action(); }
      return promise.then(onFulfill, onReject);
    },
    catch(onReject) {
      if(!promise) { promise = action(); }
      return promise.catch(onReject);
    },
    finally(handler) {
      if(!promise) { promise = action(); }
      return promise.finally(handler);
    }
  }
}

export function check<T>(description: string, check: () => Promise<T>): ReadonlyInteraction<T> {
  return { check, ...interaction(description, check) };
}

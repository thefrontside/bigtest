/**
 * An interaction represents some type of action or assertion that can be
 * taken on an {@link Interactor}.
 *
 * The interaction can function as a lazy promise. That means that calling
 * `then` on the interaction or awaiting it using `await`, will run the
 * interaction and the promise will resolve once the action is complete.
 * However, an interaction which is not awaited will not run by itself.
 *
 * @typeParam T the return value of the promise that this interaction evaluates to.
 */
export interface Interaction<T> extends Promise<T> {
  /**
   * Return a description of the interaction
   */
  description: string;
  /**
   * Perform the interaction
   */
  action: () => Promise<T>;
}

/**
 * Like {@link Interaction}, except that it is used for assertions only.
 *
 * @typeParam T the return value of the promise that this interaction evaluates to.
 */
export interface ReadonlyInteraction<T> extends Interaction<T> {
  /**
   * Perform the check
   */
  check: () => Promise<T>;
}

export function interaction<T>(description: string, action: () => Promise<T>): Interaction<T> {
  let promise: Promise<T>;
  return {
    description,
    action,
    [Symbol.toStringTag]: `[interaction ${description}]`,
    then(onFulfill, onReject) {
      if(!promise) { promise = action() }
      return promise.then(onFulfill, onReject);
    },
    catch(onReject) {
      if(!promise) { promise = action() }
      return promise.catch(onReject);
    },
    finally(handler) {
      if(!promise) { promise = action() }
      return promise.finally(handler);
    }
  };
}

export function check<T>(description: string, check: () => Promise<T>): ReadonlyInteraction<T> {
  return { check, ...interaction(description, check) };
}

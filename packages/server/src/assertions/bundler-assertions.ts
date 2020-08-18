import { BundlerTypes } from '../orchestrator/state';

export class BundlerAssertionError extends Error {
  constructor(message: string) {
    super(`INTERNAL ASSERTION FAILURE:
    While bundling test files, ${message} was received.
    this is almost certainly a bug in BigTest, and we would be very grateful if you would report
    it at https://github.com/thefrontside/bigtest/issues/new
    `)

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// as these are typescript assertions,  they do more than just type check the condition
// it will type narrow the discriminated union based on the `type` discriminator in this example
export function assertBundlerState<R extends BundlerTypes>(current: BundlerTypes, { is }: { is: R | R[] }): asserts current is R  {
  let states = Array.isArray(is) ? is : [is];
  
  if(states.includes(current as R) === false) {
    throw new BundlerAssertionError(`bundler is not currently at state ${current}`)
  }
}

export function assertCanTransition<R extends BundlerTypes>(from: BundlerTypes, {to}: { to: R}): asserts from is R  {
  if(from !== to) {
    throw new BundlerAssertionError(`invalid transition from ${from} to ${to}`)
  }
}


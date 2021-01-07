export class StatusAssertionError extends Error {
  constructor(message: string) {
    super(`INTERNAL ASSERTION FAILURE:
    While running BigTest, ${message} was received.
    this is almost certainly a bug in BigTest, and we would be very grateful if you would report
    it at https://github.com/thefrontside/bigtest/issues/new
    `);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function assertStatus<S extends { type: string }, R extends string>(current: S['type'], { is }: { is: R | R[] }): asserts current is R {
  let states = Array.isArray(is) ? is : [is];

  if(states.includes(current as R) === false) {
    throw new StatusAssertionError(`status is not currently at ${current}`);
  }
}

export class ServiceAssertionError extends Error {
  constructor(message: string) {
    super(`INTERNAL ASSERTION FAILURE:
    While running BigTest, ${message} was received.
    this is almost certainly a bug in BigTest, and we would be very grateful if you would report
    it at https://github.com/thefrontside/bigtest/issues/new
    `)

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new ServiceAssertionError(msg);
  }
}


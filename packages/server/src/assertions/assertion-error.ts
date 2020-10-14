export class AssertionError extends Error {
  constructor(message = "assertion error") {
    super(`INTERNAL ASSERTION FAILURE:
    While running BigTest, ${message} was received.
    this is almost certainly a bug in BigTest, and we would be very grateful if you would report
    it at https://github.com/thefrontside/bigtest/issues/new
    `)

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

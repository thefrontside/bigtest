export class AssertionError extends Error {
  constructor(message?: string) {
    super(message);

    this.name = 'AssertionError';

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

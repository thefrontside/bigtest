export class NoServerError extends Error {
  get name(): string { return 'NoServerError' }
}
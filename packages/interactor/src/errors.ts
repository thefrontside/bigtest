export class NoSuchElementError extends Error {
  get name() { return "NoSuchElementError" }
}

export class AmbiguousElementError extends Error {
  get name() { return "AmbiguousElementError" }
}

export class NotAbsentError extends Error {
  get name() { return "NotAbsentError" }
}

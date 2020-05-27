export class NoSuchElementError extends Error {
  get name() { return "NoSuchElementError" }
}

export class AmbigousElementError extends Error {
  get name() { return "AmbigousElementError" }
}

export class NotAbsentError extends Error {
  get name() { return "NotAbsentError" }
}

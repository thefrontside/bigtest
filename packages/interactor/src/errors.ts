export class NoSuchElementError extends Error {
  get name(): string { return "NoSuchElementError" }
}

export class AmbiguousElementError extends Error {
  get name(): string { return "AmbiguousElementError" }
}

export class NotAbsentError extends Error {
  get name(): string { return "NotAbsentError" }
}

export class FilterNotMatchingError extends Error {
  get name(): string { return "FilterNotMatchingError" }
}

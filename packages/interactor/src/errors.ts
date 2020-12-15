
/** @internal */
export class NoSuchElementError extends Error {
  get name() { return "NoSuchElementError" }
}

/** @internal */
export class AmbiguousElementError extends Error {
  get name() { return "AmbiguousElementError" }
}

/** @internal */
export class NotAbsentError extends Error {
  get name() { return "NotAbsentError" }
}

/** @internal */
export class FilterNotMatchingError extends Error {
  get name() { return "FilterNotMatchingError" }
}

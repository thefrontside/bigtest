export type Maybe<T> = Just<T> | Nothing;

export interface Just<T> {
  value: T;
}

export function Just<T>(value: T): Just<T> {
  return { value };
}

export function isJust<T>(maybe: Maybe<T>): maybe is Just<T> {
  return !isNothing(maybe);
}

export type Nothing = {};

export const Nothing = {};

export function isNothing<T>(maybe: Maybe<T>): maybe is Nothing {
  return maybe === Nothing;
}

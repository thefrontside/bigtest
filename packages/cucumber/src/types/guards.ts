export type Nothing = undefined | null;

export const isNothing = <T>(x: T | undefined | null): x is Nothing => {
  return typeof x === 'undefined' || x === null;
};

export const notNothing = <T>(x: T | undefined | null): x is T => {
  return isNothing(x) === false;
};

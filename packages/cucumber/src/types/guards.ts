export type Nothing = undefined | null;

export const notNothing = <T>(x: T | undefined | null): x is T => {
  return x !== null && x !== undefined;
};

export const isNothing = <T>(x: T | undefined | null): x is Nothing => {
  return !notNothing(x);
};

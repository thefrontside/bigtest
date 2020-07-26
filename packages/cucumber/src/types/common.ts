export type Nothing = undefined | null;

export type Fn = <A extends unknown[], R>(...args: A) => R;

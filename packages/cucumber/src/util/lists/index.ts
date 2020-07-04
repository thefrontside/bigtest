type CallBackFN<T, R> = (value: T, index: number, array: T[]) => R;

export const flatten = <T>(arr: T[][]): T[] => {
  return arr.reduce((acc, value) => acc.concat(value), [] as T[]);
};

export const asyncMap = <T, R>(arr: T[], asyncFn: (value: T) => Promise<R>): Promise<R[]> => {
  return Promise.all(arr.map(asyncFn));
};

export const asyncFlatMap = async <T, R>(arr: T[], asyncFn: (value: T) => Promise<R[]>): Promise<R[]> => {
  return Promise.all(flatten(await asyncMap<T, R[]>(arr, asyncFn)));
};

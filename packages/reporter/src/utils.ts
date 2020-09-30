import { Nullable, BundlerError } from './types';
import path from 'path';

export const isNil = <T>(val: T): val is Nullable<T> => {
  return typeof val === 'undefined' || val === null;
}

export const hasFields = <T>(o: T): o is NonNullable<T> & Required<T> => {
  return isNil(o) === false && Object.values(o).find(isNil) === false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBundlerError = (err: any): err is BundlerError => {
  return !!err.loc;
}

export const relativeFilePath = (filePath: string) => {
  if(typeof process === 'undefined' || path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.relative(process.cwd(), filePath);
}
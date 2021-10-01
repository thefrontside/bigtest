import { exec, Exec } from '@effection/process';
import { Operation, createFuture } from 'effection';
import rimraf from 'rimraf';

export function command(...args: string[]): Exec {
  return exec("yarn ts-node ./src/index.ts", {
    arguments: args,
  });
}

export function rmrf(path: string): Operation<undefined> {
  let { future, resolve, reject } = createFuture<undefined>();
  rimraf(path, (err) => {
    if(err) {
      reject(err);
    } else {
      resolve(undefined);
    }
  });
  return future;
}


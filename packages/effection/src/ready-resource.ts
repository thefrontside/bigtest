import { resource, Operation } from 'effection';
import { Deferred } from './deferred';

export function *readyResource<T>(object: T, operation: (ready: () => void) => Operation<void>): Operation<T> {
  let deferred = Deferred();
  let res = yield resource(object, operation(() => deferred.resolve(null)));
  yield deferred.promise;
  return res;
}

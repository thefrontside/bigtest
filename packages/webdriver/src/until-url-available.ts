import { Operation, spawn, timeout } from 'effection';
import { fetch } from '@effection/fetch';

class TimeoutError extends Error {
  name = 'TimeoutError';
}

/**
 * An operation that completes when the server at `url` begins
 * returning successful responses to an HTTP GET request.
 */
export function* untilURLAvailable(url: string): Operation<void> {
  while (true) {
    try {
      let response: Response = yield function*() {
        yield spawn(function* () {
          yield timeout(200);
          throw new TimeoutError('request timed out')
        });
        return yield fetch(url);
      };
      if (response.ok) {
        return;
      }
    } catch (error) {
      /* FetchError is ok. Sever may not yet be accepting connections */
      if (error.name !== 'TimeoutError' && error.name !== 'FetchError') {
        throw error;
      }
    }
  }
}

import { Operation, withTimeout } from 'effection';
import { fetch } from '@effection/fetch';

/**
 * An operation that completes when the server at `url` begins
 * returning successful responses to an HTTP GET request.
 */
export function untilURLAvailable(url: string): Operation<void> {
  return function*() {
    while (true) {
      try {
        let response: Response = yield withTimeout(200, fetch(url));
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
}

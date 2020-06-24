import { Operation, spawn, timeout } from 'effection';
import { fetch } from '@effection/fetch';

/**
 * An operation that completes when the server at `url` begins
 * returning successful responses to an HTTP GET request.
 */
export function* untilURLAvailable(url: string, maxWait: number): Operation<void> {
  yield spawn(function* () {
    yield timeout(maxWait);
    throw new Error(`timed out waiting ${maxWait}ms for ${url} to become available`)
  });
  while (true) {
    try {
      let response = yield fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      /* FetchError is ok. Sever may not yet be accepting connections */
      if (error.name !== 'FetchError') {
        throw error;
      }
    }
  }
}

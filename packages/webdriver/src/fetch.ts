import { Operation } from 'effection';
import
{ fetch as nativeFetch,
  AbortController,
  RequestInfo,
  RequestInit,
  Response
} from './native-fetch';

export { AbortController, RequestInfo, RequestInit, Response };

/**
 * Use `fetch` as an effection operation.
 *
 * This implements the `fetch` api exactly as it appears in the
 * JavaScript spec. However, an abort signal is automatically connected
 * to the underlying call so that whenever the `fetch` operation
 * passes out of scope, it is automatically cancelled. That way, it is
 * impossible to leave an http request dangling. E.g.
 *
 *   let response = yield fetch('https://bigtestjs.io');
 */
export function* fetch(resource: RequestInfo, init: RequestInit = {}): Operation<Response> {
  let controller = new AbortController();
  init.signal = controller.signal;
  try {
    return yield nativeFetch(resource, init);
  } finally {
    controller.abort();
  }
}

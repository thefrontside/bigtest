import 'regenerator-runtime/runtime';
import { wrapConsole } from './wrap-console';
import { HarnessMessage } from './harness-protocol';
import { main, spawn } from 'effection';
import { on } from '@effection/events';
import { serializeError } from './serialize-error';

function postToParent(message: HarnessMessage) {
  window.parent.postMessage(JSON.stringify(message), "*");
}

// proxy fetch and XMLHttpRequest requests through the parent frame
if(window.parent !== window) {
  window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    return window.parent.window.fetch(input, init);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).XMLHttpRequest = () => new window.parent.window.XMLHttpRequest();
}

wrapConsole((message) => {
  postToParent({ type: 'console', message: message })
});

main(function*() {
  yield spawn(
    on(window, 'error').map(([e]) => e as ErrorEvent).forEach(function*(event) {
      postToParent({ type: 'error', error: yield serializeError(event.error) });
    })
  );
  yield;
}).catch((error) => console.error(error));

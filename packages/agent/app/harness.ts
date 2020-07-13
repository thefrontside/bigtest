import { wrapConsole } from './wrap-console';
import { HarnessMessage } from './harness-protocol';

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

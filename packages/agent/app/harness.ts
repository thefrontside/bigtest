import 'regenerator-runtime/runtime';
import { wrapConsole } from './wrap-console';
import { main, spawn } from 'effection';
import { on } from '@effection/events';
import { serializeError } from './serialize-error';
import { getLogConfigFromAppFrame } from './log-config';


// proxy fetch and XMLHttpRequest requests through the parent frame
if(window.parent !== window) {
  window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    return window.parent.window.fetch(input, init);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).XMLHttpRequest = () => new window.parent.window.XMLHttpRequest();
}

wrapConsole((message) => {
  getLogConfigFromAppFrame()?.events.push({ type: 'message', occurredAt: new Date().toString(), message: message })
});

main(function*() {
  yield spawn(
    on(window, 'error').map(([e]) => e as ErrorEvent).forEach(function*(event) {
      getLogConfigFromAppFrame()?.events.push({ type: 'error', occurredAt: new Date().toString(), error: yield serializeError(event.error) });
    })
  );
  yield;
}).catch((error) => console.error(error));

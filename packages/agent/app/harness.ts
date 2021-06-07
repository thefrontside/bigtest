import 'regenerator-runtime/runtime';
import { wrapConsole } from './wrap-console';
import { run, spawn, on, Operation } from 'effection';
import { serializeError } from './serialize-error';
import { getLogConfigFromAppFrame } from './log-config';

// proxy fetch and XMLHttpRequest requests through the parent frame
if(window.parent !== window) {
  window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    return window.parent.window.fetch(input, init);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).XMLHttpRequest = () => new window.parent.window.XMLHttpRequest();

  window.indexedDB.open = function open(this: typeof window.indexedDB, name: string, version?: number) {
    return window.parent.window.indexedDB.open(name, version);
  }
}

wrapConsole((message) => {
  getLogConfigFromAppFrame()?.events.push({ type: 'message', occurredAt: new Date().toString(), message: message })
});

run(function*() {
  yield spawn(
    on(window, 'error').map((e) => e as ErrorEvent).forEach(function*(event): Operation<void> {
      getLogConfigFromAppFrame()?.events.push({ type: 'error', occurredAt: new Date().toString(), error: yield serializeError(event.error) });
    })
  );
  yield;
}).catch((error) => console.error(error));

import 'regenerator-runtime/runtime';
import { main } from 'effection';
import { createHarness } from './create-harness';

main(createHarness())
  .catch(error => console.error(error));


// proxy fetch requests through the parent frame
window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  return window.parent.window.fetch(input, init);
}

// proxy XMLHttpRequest through the parent frame
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).XMLHttpRequest = () => new window.parent.window.XMLHttpRequest();

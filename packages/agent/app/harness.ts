import 'regenerator-runtime/runtime';
import { main } from 'effection';
import { ParentFrame } from './parent-frame';

main(function*() {
  console.log('[harness] starting');

  let parentFrame = yield ParentFrame.start();

  while(true) {
    let message = yield parentFrame.receive();
    console.info('[harness] got message', message);
  }
}).catch(error => console.error(error));


// proxy fetch and XMLHttpRequest requests through the parent frame
if(window.parent !== window) {
  window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    return window.parent.window.fetch(input, init);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).XMLHttpRequest = () => new window.parent.window.XMLHttpRequest();
}

import { ParentFrame } from './parent-frame';

export function* createHarness() {
  console.log('[harness] starting');

  let parentFrame = yield ParentFrame.start();

  while(true) {
    let message = yield parentFrame.receive();
    console.info('[harness] got message', message);
  }
}


import { fork } from 'effection';

import { main } from '../src/index';

fork(function*() {
  let interrupt = () => { console.log('');  this.halt()};
  process.on('SIGINT', interrupt);
  try {
    yield main;
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

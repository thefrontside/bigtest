import { fork } from 'effection';

import { createOrchestrator } from '../src/index';

fork(function*() {
  let interrupt = () => { console.log('');  this.halt()};
  process.on('SIGINT', interrupt);
  try {
    yield createOrchestrator({
      appPort: 24000,
      proxyPort: 24001,
      commandPort: 24002,
      connectionPort: 24003,
      agentPort: 24004,
    });
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

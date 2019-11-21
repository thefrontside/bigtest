import { fork } from 'effection';

import { Orchestrator } from '../src/index';

fork(function*() {
  let interrupt = () => { console.log('');  this.halt()};
  process.on('SIGINT', interrupt);

  try {
    let orchestrator = new Orchestrator({
      appPort: 24000,
      proxyPort: 24001,
      commandPort: 24002,
      connectionPort: 24003,
      agentPort: 24004,
    });

    orchestrator.start();

    yield;
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

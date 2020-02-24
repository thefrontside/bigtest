import { fork } from 'effection';
import { main } from '@effection/node';
import { Mailbox } from '@effection/events';
import * as tempy from 'tempy';
import { setLogLevel } from '../src/log-level';

import { createOrchestrator, Atom } from '../src/index';

setLogLevel('info');

main(function*() {
  let delegate = new Mailbox();
  let atom = new Atom();

  yield fork(createOrchestrator({
    delegate,
    atom,
    appCommand: "yarn",
    appArgs: ["test:app:start"],
    appEnv: {
      "PORT": "24000",
      "BROWSER": "none",
    },
    appPort: 24000,
    proxyPort: 24001,
    commandPort: 24002,
    connectionPort: 24003,
    agentPort: 24004,
    externalAgentServerURL: process.env['BIGTEST_AGENT_SERVER_URL'],
    manifestPort: 24005,
    testFiles: ["./test/fixtures/*.t.js"],
    cacheDir: tempy.directory(),
  }));

  yield delegate.receive({ status: 'ready' });

  console.log("[cli] orchestrator ready!");

  yield
})

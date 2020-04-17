import { fork } from 'effection';
import { main } from '@effection/node';
import { Mailbox } from '@bigtest/effection';
import * as tempy from 'tempy';
import { setLogLevel } from '@bigtest/logging';

import { createOrchestrator, createOrchestratorAtom } from '../src/index';

setLogLevel(process.env.LOG_LEVEL || 'info');

main(function*() {
  let delegate = new Mailbox();
  let atom = createOrchestratorAtom();

  yield fork(createOrchestrator({
    delegate,
    atom,
    appCommand: "yarn",
    appArgs: ["test:app:start", "24000"],
    appEnv: {},
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

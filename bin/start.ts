import { fork } from 'effection';
import { main } from '@effection/node';
import * as tempy from 'tempy';

import { createOrchestrator } from '../src/index';
import { Mailbox } from '@effection/events';

main(function*() {
  let mailbox = new Mailbox();

  yield fork(createOrchestrator({
    delegate: mailbox,
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
    testFilePort: 24005,
    testFiles: ["./test/fixtures/*.t.ts"],
    testManifestPath: tempy.file({ name: 'manifest.js' }),
  }));

  yield mailbox.receive({ ready: "orchestrator" });

  console.log("[cli] orchestrator ready!");

  yield
})

import { fork, receive } from 'effection';
import { main } from '@effection/node';
import * as tempy from 'tempy';

import { createOrchestrator } from '../src/index';

main(function*() {
  let orchestrator = yield fork(createOrchestrator({
    delegate: this,
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

  yield receive({ ready: "orchestrator" }, orchestrator);

  console.log("[cli] orchestrator ready!");

  yield
})

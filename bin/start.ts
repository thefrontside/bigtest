import { fork, receive } from 'effection';
import * as tempy from 'tempy';

import { createOrchestrator } from '../src/index';

fork(function*() {
  let interrupt = () => { this.halt()};
  process.on('SIGINT', interrupt);

  try {
    fork(createOrchestrator({
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
      testFiles: ["./test/fixtures/*.t.ts"],
      testManifestPath: tempy.file({ name: 'manifest.js' }),
    }));

    yield receive({ ready: "orchestrator" });

    console.log("[cli] orchestrator ready!");

    yield;
  } catch (e) {
    console.log(e);
    console.log(this.toString());
  } finally {
    process.off('SIGINT', interrupt);
  }
});

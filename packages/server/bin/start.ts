import { fork } from 'effection';
import { main } from '@effection/node';
import { Mailbox } from '@bigtest/effection';
import { setLogLevel } from '@bigtest/logging';

import { createServer } from '../src/index';

setLogLevel(process.env.LOG_LEVEL || 'info');

main(function*() {
  yield createServer({
    port: 24002,
    app: {
      command: "yarn",
      args: ["test:app:start", "24000"],
      env: {},
      port: 24000,
    },
    proxy: {
      port: 24001,
    },
    connection: {
      port: 24003,
    },
    agent: {
      port: 24004,
    },
    manifest: {
      port: 24005,
    },
    testFiles: ["./test/fixtures/*.t.js"],
    cacheDir: "./tmp/start"
  });
});

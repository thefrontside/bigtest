import { fork } from 'effection';
import { on } from '@effection/events';

import { spawn } from 'child_process';

export function* agentServer(port: number) {

  let child = spawn('parcel', ['-p', `${port}`, 'agent/index.html', 'agent/harness.ts'], {
    stdio: 'inherit'
  });

  fork(function*() {
    let [error]: [Error] = yield on(child, "error");
    throw error;
  })

  try {
    yield on(child, "exit");
  } finally {
    child.kill();
  }
}

import { fork, Sequence, Execution } from 'effection';
import { on } from '@effection/events';
import { fork as forkProcess } from 'child_process';

interface AgentServerOptions {
  port: number;
};


export function* createAgentServer(orchestrator: Execution, options: AgentServerOptions): Sequence {
  // TODO: what is the correct way of specifying the path here?
  let child = forkProcess('./bin/parcel-server', ['-p', `${options.port}`, 'agent/index.html', 'agent/harness.ts'], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  });

  fork(function*() {
    let [error]: [Error] = yield on(child, "error");
    throw error;
  })

  try {

    let message: {type: string};
    do {
      [message] = yield on(child, "message");
    } while(message.type !== "ready");

    orchestrator.send({ ready: "agent" });

    yield on(child, "exit");
  } finally {
    child.kill('SIGINT');
  }
}

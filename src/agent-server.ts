import { fork, Sequence, Operation, Execution } from 'effection';
import { on } from '@effection/events';
import { fork as forkProcess } from 'child_process';

interface AgentServerOptions {
  port: number;
};

export class AgentServer extends Process {
  constructor(public options: AgentServerOptions) {
    super();
  }

  protected *run(ready): Sequence {
    // TODO: what is the correct way of specifying the path here?
    let child = forkProcess('./bin/parcel-server', ['-p', `${this.options.port}`, 'agent/index.html', 'agent/harness.ts'], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    fork(function*() {
      let [error]: [Error] = yield on(child, "error");
      throw error;
    })

    let message;
    do {
      [message] = yield on(child, "message");
    } while(message.type !== "ready");

    ready();

    try {
      yield on(child, "exit");
    } finally {
      child.kill('SIGINT');
    }
  }
}

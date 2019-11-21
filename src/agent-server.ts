import { fork, Sequence } from 'effection';
import { on } from '@effection/events';
import { spawn } from 'child_process';

import { Process } from './process';

interface AgensServerOptions {
  port: number;
};

export class AgentServer extends Process {
  constructor(public options: AgensServerOptions) {
    super();
  }

  protected *run(ready): Sequence {
    let child = spawn('parcel', ['-p', `${this.options.port}`, 'agent/index.html', 'agent/harness.ts'], {
      stdio: 'inherit'
    });

    fork(function*() {
      let [error]: [Error] = yield on(child, "error");
      throw error;
    })

    // TODO: this isn't *actually* when the agent is ready
    ready();

    try {
      yield on(child, "exit");
    } finally {
      child.kill();
    }
  }
}

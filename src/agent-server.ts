import { fork, Sequence, Operation, Execution } from 'effection';
import { on } from '@effection/events';
import { spawn } from 'child_process';

import { Process } from './process';

interface AgentServerOptions {
  port: number;
};

export function createAgentServer(orchestrator: Execution, options: AgentServerOptions): Operation {
  return function *agentServer(): Sequence {
    let child = spawn('parcel', ['-p', `${options.port}`, 'agent/index.html', 'agent/harness.ts'], {
      stdio: 'inherit'
    });

    fork(function*() {
      let [error]: [Error] = yield on(child, "error");
      throw error;
    })

    // TODO: this isn't *actually* when the agent is ready
    orchestrator.send({ ready: "agent" });

    try {
      yield on(child, "exit");
    } finally {
      child.kill();
    }
  }
}

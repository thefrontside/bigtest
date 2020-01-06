import { monitor, Sequence, Execution } from 'effection';
import { on } from '@effection/events';
import { ChildProcess, fork as forkProcess } from '@effection/child_process';

interface AgentServerOptions {
  port: number;
};


export function* createAgentServer(orchestrator: Execution, options: AgentServerOptions): Sequence {
  // TODO: this should use node rather than ts-node when running as a compiled package
  let child: ChildProcess = yield forkProcess('./bin/parcel-server.ts', ['-p', `${options.port}`, 'agent/index.html', 'agent/harness.ts'], {
    execPath: 'ts-node',
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  });

  let message: {type: string};
  do {
    [message] = yield on(child, "message");
  } while(message.type !== "ready");

  orchestrator.send({ ready: "agent" });

  yield on(child, "exit");
}

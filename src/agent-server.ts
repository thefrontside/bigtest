import { send, Operation, Context } from 'effection';
import { on } from '@effection/events';
import { ChildProcess, fork as forkProcess } from '@effection/child_process';

interface AgentServerOptions {
  port: number;
};

export function* createAgentServer(orchestrator: Context, options: AgentServerOptions): Operation {
  // TODO: @precompile we want this to use a precompiled agent server when used as a package
  let child: ChildProcess = yield forkProcess(
    './bin/parcel-server.ts',
    ['-p', `${options.port}`, 'agent/index.html', 'agent/harness.ts'],
    {
      execPath: 'ts-node',
      execArgv: [],
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    }
  );

  let message: {type: string};
  do {
    [message] = yield on(child, "message");
  } while(message.type !== "ready");

  yield send({ ready: "agent" }, orchestrator);

  yield on(child, "exit");
}

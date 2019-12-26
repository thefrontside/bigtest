import { fork, timeout, Sequence, Operation, Execution, Controller } from 'effection';
import { on } from '@effection/events';
import { spawn } from '@effection/child_process';
import { Socket } from 'net';
import * as process from 'process';

interface AppServerOptions {
  dir?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  port: number;
};

function isReachable(port: number, options: { timeout: number } = { timeout: 10000 }): Controller {
  return (execution) => {
    let socket = new Socket();

    let onError = () => {
      socket.destroy();
      execution.resume(false);
    };

    socket.setTimeout(options.timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, '127.0.0.1', () => {
      socket.destroy();
      execution.resume(true);
    });

    return () => { socket.destroy() };
  }
};

export function createAppServer(orchestrator: Execution, options: AppServerOptions): Operation {
  return function *agentServer(): Sequence {
    let child = yield spawn(options.command, options.args || [], {
      cwd: options.dir,
      detached: true,
      env: Object.assign({}, process.env, options.env),
    });

    let errorMonitor = fork(function*() {
      let [error]: [Error] = yield on(child, "error");
      throw error;
    });

    this.atExit(() => errorMonitor.halt());

    while(!(yield isReachable(options.port))) {
      yield timeout(100);
    }

    orchestrator.send({ ready: "app" });

    yield on(child, "exit");
  }
}

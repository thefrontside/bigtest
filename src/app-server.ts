import { fork, timeout, Sequence, Operation, Execution, Controller } from 'effection';
import { on } from '@effection/events';
import { exec } from 'child_process';
import { Socket } from 'net';

interface AppServerOptions {
  dir?: string;
  command: string;
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
      socket.end();
      execution.resume(true);
    });

    return () => { socket.destroy() };
  }
};

export function createAppServer(orchestrator: Execution, options: AppServerOptions): Operation {
  return function *agentServer(): Sequence {
    let child = exec(options.command, { cwd: options.dir });

    let errorMonitor = fork(function*() {
      let [error]: [Error] = yield on(child, "error");
      throw error;
    });

    while(!(yield isReachable(options.port))) {
      yield timeout(100);
    }

    orchestrator.send({ ready: "app" });

    try {
      yield on(child, "exit");
    } finally {
      errorMonitor.halt();
      child.kill();
    }
  }
}

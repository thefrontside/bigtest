import { fork, timeout, Sequence, Operation, Execution } from 'effection';
import { on } from '@effection/events';
import { exec } from 'child_process';
import { Socket } from 'net';

interface AppServerOptions {
  dir?: string;
  command: string;
  port: number;
};

function isReachable(port: number, options: { timeout: number } = { timeout: 10000 }) {
  return new Promise(((resolve, reject) => {
    let socket = new Socket();

    let onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(options.timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, '127.0.0.1', () => {
      socket.end();
      resolve(true);
    });
  }));
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

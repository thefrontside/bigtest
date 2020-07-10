import { timeout, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { ChildProcess } from '@effection/node';
import { Socket } from 'net';
import * as process from 'process';
import { createWriteStream } from 'fs';

interface AppServerOptions {
  delegate: Mailbox;
  dir?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  port: number;
  logPath: string;
};

function isReachable(port: number, options: { timeout: number } = { timeout: 10000 }): Operation {
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

    execution.ensure(() => socket.destroy());
  }
};

export function* createAppServer(options: AppServerOptions): Operation {
  let child = yield ChildProcess.spawn(options.command, options.args || [], {
    cwd: options.dir,
    detached: true,
    env: Object.assign({}, process.env, options.env),
  });

  let logStream = createWriteStream(options.logPath);
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  while(!(yield isReachable(options.port))) {
    yield timeout(100);
  }

  options.delegate.send({ status: 'ready' });

  yield;
}

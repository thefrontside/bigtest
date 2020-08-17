import { timeout, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { fetch } from '@effection/fetch';
import { ChildProcess } from '@effection/node';
import * as process from 'process';

interface AppServerOptions {
  delegate: Mailbox;
  dir?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  port: number;
};

function* isReachable(port: number) {
  try {
    let response: Response = yield fetch(`http://127.0.0.1:${port}`)
    return response.ok
  } catch (error) {
    return false;
  }
}

export function* createAppServer(options: AppServerOptions): Operation {
  yield ChildProcess.spawn(options.command, options.args || [], {
    cwd: options.dir,
    detached: true,
    env: Object.assign({}, process.env, options.env),
  });

  while(!(yield isReachable(options.port))) {
    yield timeout(100);
  }

  options.delegate.send({ status: 'ready' });

  yield;
}

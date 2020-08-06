import { timeout, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { fetch } from '@effection/fetch';
import { ChildProcess } from '@effection/node';
import * as process from 'process';

interface AppServerOptions {
  delegate: Mailbox;
  dir?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url: string;
};

function* isReachable(url: string) {
  try {
    let response: Response = yield fetch(url)
    return response.ok
  } catch (error) {
    return false;
  }
}

export function* createAppServer(options: AppServerOptions): Operation {
  if (options.command) {
    yield ChildProcess.spawn(options.command, options.args || [], {
      cwd: options.dir,
      detached: true,
      env: Object.assign({}, process.env, options.env),
      shell: true,
    });
  }

  while(!(yield isReachable(options.url))) {
    yield timeout(100);
  }

  options.delegate.send({ status: 'ready' });

  yield;
}

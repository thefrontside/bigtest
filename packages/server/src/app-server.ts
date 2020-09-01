import { timeout, Operation, spawn } from 'effection';
import { once } from '@effection/events';
import { fetch } from '@effection/fetch';
import { ChildProcess } from '@effection/node';
import * as process from 'process';
import { OrchestratorState, AppOptions } from './orchestrator/state';
import { Atom } from '@bigtest/atom';
import { restartable } from './effection/restartable'

interface AppServerOptions {
  atom: Atom<OrchestratorState>;
};

export function createAppServer(options: AppServerOptions): Operation {
  let appOptions = options.atom.slice('appService', 'appOptions');
  return restartable(appOptions, startApp(options));
}

const startApp = ({ atom }: AppServerOptions) => function* (options: AppOptions): Operation<void> {
  let appStatus = atom.slice('appService', 'appStatus');

  appStatus.set('unstarted')

  if (options.command) {
    let child = yield ChildProcess.spawn(options.command as string, [], {
      cwd: options.dir,
      detached: true,
      env: Object.assign({}, process.env, options.env),
      shell: true,
    });

    yield spawn(function* () {
      yield once(child, 'exit');
      appStatus.set('crashed');
    });
  }

  appStatus.set('started');

  while(true) {
    yield timeout(100);

    if (yield isReachable(options.url)) {
      appStatus.set('reachable');
    } else {
      appStatus.set('unreachable');
    }
  }
}

function* isReachable(url: string) {
  try {
    let response: Response = yield fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}
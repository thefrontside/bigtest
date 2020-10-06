import { timeout, Operation, spawn } from 'effection';
import { fetch } from '@effection/fetch';
import { exec, Process } from '@effection/node';
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
  if(!options.url) {
    throw new Error('no app url given');
  }

  let appStatus = atom.slice('appService', 'appStatus');

  appStatus.set('unstarted')

  if (options.command) {

    let child: Process = yield exec(options.command as string, {
      cwd: options.dir,
      env: Object.assign({}, process.env, options.env),
    });

    yield spawn(function* () {
      yield child.join();
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

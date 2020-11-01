import { timeout, spawn } from 'effection';
import { fetch } from '@effection/fetch';
import { exec, Process } from '@effection/node';
import * as process from 'process';
import { OrchestratorState, AppOptions, Service, AppServiceStatus } from './orchestrator/state';
import { Slice } from '@bigtest/atom';
import { restartable } from './effection/restartable'
import { assert } from './assertions/assert';

export const appServer: Service<AppServiceStatus, AppOptions> = (slice, options) => {
  let appOptions = options.atom.slice('appService', 'options');

  return restartable(appOptions, startApp(slice));
}

const startApp = (appStatus: Slice<AppServiceStatus, OrchestratorState>) => function* (options: AppOptions) {
  assert(options.url, 'no app url given');
  
  if (options.command) {
    let child: Process = yield exec(options.command as string, {
      cwd: options.dir,
      env: Object.assign({}, process.env, options.env),
    });

    yield spawn(function* () {
      let exitStatus = yield child.join();

      appStatus.set({ type: 'exited', exitStatus });
    });
  }

  appStatus.set({ type: 'started' });

  while(!(yield isReachable(options.url))) {
    yield timeout(100);
  }

  appStatus.set({ type: 'ready' });

  yield;
}

function* isReachable(url: string) {
  try {
    let response: Response = yield fetch(url);
    return response.ok;
  } catch (error) {
    if (error.name === 'FetchError') {
      return false;
    } else {
      throw error;
    }
  }
}

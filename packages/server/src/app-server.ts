import { timeout, Operation, spawn } from 'effection';
import { once } from '@effection/events';
import { fetch } from '@effection/fetch';
import { ChildProcess } from '@effection/node';
import * as process from 'process';
import { OrchestratorState, AppServiceState, AppOptions, AppStatus } from './orchestrator/state';
import { Slice } from '@bigtest/atom';
import { restartable } from './effection/restartable'

interface AppServerOptions {
  slice: Slice<AppServiceState, OrchestratorState>;
  url: string;
  command?: string;
  env?: Record<string, string>;
  dir?: string;
};

export function createAppServer({ slice, ...options }: AppServerOptions): Operation {
  let appOptions = slice.slice('appOptions');
  let appStatus = slice.slice('appStatus');

  return restartable(appOptions, (currentOptions) =>
    startApp(appStatus, currentOptions ?? options)
  );
}

function* isReachable(url: string) {
  try {
    let response: Response = yield fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

function* startApp(appStatus: Slice<AppStatus, OrchestratorState>, options: AppOptions): Operation<void> {
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

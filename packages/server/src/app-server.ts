import { timeout, spawn } from 'effection';
import { fetch } from '@effection/fetch';
import { exec, Process } from '@effection/node';
import * as process from 'process';
import { AppOptions, Service, AppServiceStatus, ServiceState } from './orchestrator/state';
import { Slice } from '@bigtest/atom';
import { restartable } from './effection/restartable'
import { assert } from 'assert-ts';

export const appServer: Service<AppServiceStatus, AppOptions> = (serviceSlice) => {
  let appOptions = serviceSlice.slice()('options');

  return restartable(appOptions, startApp(serviceSlice));
}

const startApp = (serviceSlice: Slice<ServiceState<AppServiceStatus, AppOptions>>) => function* (options: AppOptions) {
  assert(!!options.url, 'no app url given');

  let appServiceStatus = serviceSlice.slice('status')

  if (options.command) {
    let child: Process = yield exec(options.command as string, {
      cwd: options.dir,
      env: Object.assign({}, process.env, options.env),
    });

    yield spawn(function* () {
      let exitStatus = yield child.join();

      appServiceStatus.set({ type: 'exited', exitStatus });
    });
  }

  appServiceStatus.set({ type: 'started' });

  while(!(yield isReachable(options.url))) {
    yield timeout(100);
  }

  appServiceStatus.set({ type: 'available' });

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

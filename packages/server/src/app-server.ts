import { timeout, Operation, Context, fork } from 'effection';
import { once } from '@effection/events';
import { Subscribable } from '@effection/subscription';
import { fetch } from '@effection/fetch';
import { ChildProcess } from '@effection/node';
import * as process from 'process';
import { OrchestratorState, AppServiceState, AppOptions, AppStatus } from './orchestrator/state';
import { Slice } from '@bigtest/atom';

interface AppServerOptions {
  slice: Slice<AppServiceState, OrchestratorState>;
  url: string;
  command?: string;
  env?: Record<string, string>;
  dir?: string;
};

function* isReachable(url: string) {
  try {
    let response: Response = yield fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function* createAppServer({ slice, ...options }: AppServerOptions): Operation {
  let appOptions = slice.slice('appOptions');
  let appStatus = slice.slice('appStatus');
  let current: Context;

  function* startApp(appOptions: AppOptions): Operation<void> {
    if (current) {
      current.halt();
    }

    appStatus.set('unstarted');

    current = yield fork(function* () {
      if (appOptions.command) {
        let child = yield ChildProcess.spawn(appOptions.command as string, [], {
          cwd: appOptions.dir,
          detached: true,
          env: Object.assign({}, process.env, appOptions.env),
          shell: true,
        });

        yield fork(function* () {
          yield once(child, 'exit');
          appStatus.set('crashed');
        })
      }

      appStatus.set('started');

      while(true) {
        yield timeout(100);

        if (yield isReachable(appOptions.url)) {
          appStatus.set('reachable');
        } else {
          appStatus.set('unreachable');
        }
      }
    });
  }

  let currentOptions = appOptions.get();
  yield fork(
    Subscribable
      .from(appOptions)
      .filter(appOptions => appOptions !== currentOptions)
      .forEach(options => function* () {
        if (options) {
          return yield startApp(options);
        }
      })
  );

  yield startApp(options);
}

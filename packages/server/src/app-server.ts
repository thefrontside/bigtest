import { timeout, Operation, Context, fork } from 'effection';
import { Subscribable } from '@effection/subscription'
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
  let appOptions = slice.slice<AppOptions>(['appOptions']);
  let appStatus = slice.slice<AppStatus>(['appStatus']);
  let current: Context;

  function* startApp(appOptions: AppOptions): Operation<void> {
    if (!appOptions) {
      return;
    }

    if (current) {
      console.debug("[app]", 'halting');
      current.halt();
    }

    console.debug("[app]", 'unstarted');
    appStatus.set('unstarted');

    current = yield fork(function* () {
      if (appOptions.command) {
        let child = yield ChildProcess.spawn(appOptions.command as string, [], {
          cwd: appOptions.dir,
          detached: true,
          env: Object.assign({}, process.env, appOptions.env),
          shell: true,
          stdio: 'inherit'
        });

        child.on('exit', (code: number, signal: string) => {
          console.log("🧨", code, signal);
          appStatus.set('crashed');
        });
      }

      console.debug('[app]', 'started');
      appStatus.set('started');

      while(true) {
        yield timeout(100);

        if (yield isReachable(appOptions.url)) {
          if (appStatus.get() !== 'reachable') {
            console.debug('[app]', 'reachable');
            appStatus.set('reachable');
          }
        } else {
          if (appStatus.get() !== 'unreachable') {
            console.debug('[app]', 'unreachable');
            appStatus.set('unreachable');
          }
        }
      }
    });
  }

  yield fork(Subscribable.from(appOptions).forEach(startApp));

  yield startApp(options);
}

import { Operation, sleep, spawn, fetch } from 'effection';
import { exec, Process  } from '@effection/process';
import { AppServerStatus } from './orchestrator/state';
import { Slice } from '@effection/atom';
import { assert } from 'assert-ts';

interface AppServerOptions {
  status: Slice<AppServerStatus>;
  url?: string;
  command?: string;
  env?: Record<string, string>;
  dir?: string;
}

export function* appServer(options: AppServerOptions): Operation<void> {
  assert(!!options.url, 'no app url given');

  if (options.command) {
    let child: Process = yield exec(options.command as string, {
      cwd: options.dir,
      env: Object.assign({}, process.env, options.env),
    });

    let stdoutBuffer = yield child.stdout.lines().toBuffer(1000);
    let stderrBuffer = yield child.stderr.lines().toBuffer(1000);

    yield spawn(function* () {
      let exitStatus = yield child.join();
      options.status.set({
        type: 'exited',
        exitStatus: {
          ...exitStatus,
          stdout: Array.from(stdoutBuffer).join("\n"),
          stderr: Array.from(stderrBuffer).join("\n"),
        }
      });
    });
  }

  options.status.set({ type: 'started' });

  while(!(yield isReachable(options.url))) {
    yield sleep(100);
  }

  options.status.set({ type: 'available' });

  yield;
}

function* isReachable(url: string): Operation<boolean> {
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

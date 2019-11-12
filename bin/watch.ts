import * as cp from 'child_process';
import * as fs from 'fs';
import { fork, Sequence } from 'effection';

import { EventEmitter } from '../src/util';

function* watch(): Sequence {
  let [ cmd, ...args ] = process.argv.slice(2);

  let listener = fork(function* changes() {
    let watcher = FileWatcher.watch('src', { recursive: true });
    try {
      while (true) {
        yield watcher.on("change");
        console.log('change detected, restarting....');
        restart();
      }
    } finally {
      watcher.close();
    }
  });

  let current = { halt: (x = undefined) => x };
  let restart = () => {
    current.halt();
    current = this.fork(function*() {
      try {
        yield launch(cmd, args);
        listener.halt();
      } catch (error) {
        console.log(error);
      }
    })
  };

  restart();
}



interface WatchOptions {
  encoding?: BufferEncoding | null;
  persistent?: boolean;
  recursive?: boolean;
}

type WatchOptionsType = WatchOptions | BufferEncoding | undefined | null;

class FileWatcher extends EventEmitter<fs.FSWatcher, "change"> {
  static watch(filename: string, options: WatchOptionsType) {
    return new FileWatcher(fs.watch(filename, options));
  }

  close() {
    this.inner.close();
  }
}

class ChildProcess extends EventEmitter<cp.ChildProcess, "error" | "exit"> {
  static spawn(cmd: string, args: string[] = [], options: cp.SpawnOptions) {
    return new ChildProcess(cp.spawn(cmd, args, options));
  }

  kill(signal?: string) {
    this.inner.kill(signal);
  }
}

function* launch(cmd: string, args: string[]): Sequence {
  let child = ChildProcess.spawn(cmd, args, { stdio: 'inherit'});

  fork(function*() {
    let errors = fork(function*() {
      let [ error ] = yield child.on("error");
      throw error;
    });

    try {
      let [ code ] = yield child.on('exit');
      errors.halt();

      if (code > 0) {
        throw new Error(`exited with code ${code}`)
      }
    } finally {
      child.kill();
    }
  })


}

fork(function* main() {
  let interrupt = () => { console.log('');  this.halt()};
  process.on('SIGINT', interrupt);
  try {
    yield watch;
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

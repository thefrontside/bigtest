import { fork, Sequence } from 'effection';
import { spawn } from '@effection/node/child_process';
import { watch } from '@effection/node/fs';

function* start(): Sequence {
  let [ cmd, ...args ] = process.argv.slice(2);

  let listener = fork(function* changes() {
    let watcher = watch('src', { recursive: true });
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

function* launch(cmd: string, args: string[]): Sequence {
  let child = spawn(cmd, args, { stdio: 'inherit'});

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
    yield start;
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

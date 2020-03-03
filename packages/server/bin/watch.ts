import { watch } from 'fs';
import { spawn } from 'child_process';
import { main, fork, Operation, Context } from 'effection';
import { once } from '@bigtest/effection';

const self: Operation = ({ resume, context: { parent }}) => resume(parent);

function* start(): Operation {
  let [ cmd, ...args ] = process.argv.slice(2);

  let listener = yield fork(function* changes() {
    let watcher = watch('src', { recursive: true });
    try {
      while (true) {
        yield once(watcher, "change");
        console.log('change detected, restarting....');
        restart();
      }
    } finally {
      watcher.close();
    }
  });

  let current = { halt: (x = undefined) => x };
  let context = yield self;
  let restart = () => {
    current.halt();
    current = context.spawn(fork(function*() {
      try {
        yield launch(cmd, args);
        listener.halt();
      } catch (error) {
        console.log(error);
      }
    }));
  };

  restart();
}

function* launch(cmd: string, args: string[]): Operation {
  let child = spawn(cmd, args, { stdio: 'inherit'});

  yield fork(function*() {
    let errors = yield fork(function*() {
      let [ error ] = yield once(child, "error");
      throw error;
    });

    try {
      let [ code ] = yield once(child, 'exit');
      errors.halt();

      if (code > 0) {
        throw new Error(`exited with code ${code}`)
      }
    } finally {
      child.kill();
    }
  })


}

main(function* main() {
  let context: Context = yield self;
  let interrupt = () => { console.log('');  context.halt()};
  process.on('SIGINT', interrupt);
  try {
    yield start;
  } catch (e) {
    console.log(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
});

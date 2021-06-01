import { run, Operation } from 'effection';
import { once, EventEmitter } from 'events';

interface Debugger {
  play(): void;
  step(): void;
  pause(): void;
}

export function createDebugger(): [() => Operation<void>, Debugger] {
  let mode: 'paused' | 'playing' = 'paused';
  let signal = new EventEmitter();
  let debug: Debugger = {
    // mode is either 'paused or playing'
    play() {
      mode = 'playing';
      signal.emit('playing');
    },
    step() {
      mode = 'paused';
      signal.emit('playing');
    },
    pause() {
      mode = 'paused';
    }
  }

  function* debugpoint() {
    if (mode === 'paused') {
      // in the event that there are no other callbacks in node
      // it will exit, so just create an artifictial one here.
      let timeoutId = setTimeout(() => {}, 1 << 30);
      try {
        yield once(signal, 'playing');
      } finally {
        clearTimeout(timeoutId);
      }
    } else {
      return;
    }
  }
  return [debugpoint, debug]
}

run(function*() {
  let [debug, { step, pause, play }] = createDebugger();

  process.on('SIGUSR2', () => step())
  process.on('SIGCONT', () => play())

  console.log('starting', process.pid);

  pause()

  for (let i = 1; i < 10; i++) {
    console.log(`step ${i} complete`);
    yield debug();
  }
})

// pause
// -- suspend at the next point
// play
//   -- unsuspend and you are now free to do
// step
//  -- unspend, but suspend at the next point
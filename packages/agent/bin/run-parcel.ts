
import { EventEmitter } from 'events';

import { main, once } from './helpers';
import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from 'parcel-bundler';

main(function* bundle() {
  let bundler: ParcelBundler = new Bundler(['app/index.html', 'app/harness.ts'], {
    outDir: 'dist/app',
    watch: true
  });

  bundler.bundle();

  try {
    yield once(bundler, 'buildEnd');
    if (process.send) {
      process.send('ready');
    } else {
      console.warn('run-parcel invoked without parent process');
    }
    yield;
  } finally {
    bundler.stop();
  }
});

interface ParcelBundler extends EventEmitter {
  bundle(): Promise<void>;
  stop(): void;
  options: ParcelOptions;
}

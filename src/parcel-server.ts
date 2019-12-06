import { fork, Sequence } from 'effection';
import { on } from '@effection/events';
import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from 'parcel-bundler';
import { Server } from 'http';

interface ParcelServerOptions {
  port: number;
};

export function* createParcelServer(entryPoints: string[], options: ParcelServerOptions, parcelOptions?: ParcelOptions): Sequence {
  let bundler: ParcelBundler = new Bundler(entryPoints, parcelOptions || {});
  let server = yield bundler.serve(options.port);

  if (process.send) {
    process.send({ type: "ready" });

    fork(function* stdout() {
      while (true) {
        let [data]: [string] = yield on(process.stdout, 'data');
        process.send({ stdout: data });
      }
    });

    fork(function* stderr() {
      while (true) {
        let [data]: [string] = yield on(process.stderr, 'data');
        process.send({ stderr: data });
      }
    });

    process.on('message', message => {
      console.log('message from parent:', message);
    });
  }

  try {
    yield;
  } finally {
    bundler.stop();
    server.close();
  }
}

interface ParcelBundler {
  serve(port: number): Promise<Server>;
  stop(): void;
}

import { Operation, receive } from 'effection';
import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from 'parcel-bundler';
import { createServer, RequestListener } from 'http';
import { watch } from '@effection/events';
import { EventEmitter } from 'events';
import { listen } from './http';

interface ParcelServerOptions {
  port: number;
};

export function* createParcelServer(entryPoints: string[], options: ParcelServerOptions, parcelOptions?: ParcelOptions): Operation {
  let bundler: ParcelBundler = new Bundler(entryPoints, parcelOptions || {});

  yield watch(bundler, "buildEnd");

  let middleware = bundler.middleware();
  let server = createServer(middleware)

  try {
    yield listen(server, options.port);

    yield receive({ event: "buildEnd" });

    if (process.send) {
      process.send({ type: "ready", options: bundler.options });
    }

    while(true) {
      yield receive({ event: "buildEnd" });

      process.send({ type: "update" });
    }
    yield;
  } finally {
    bundler.stop();
    server.close();
  }
}

interface ParcelBundler extends EventEmitter {
  middleware(): RequestListener;
  stop(): void;
  options: ParcelOptions;
}

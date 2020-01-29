import { Operation, receive } from 'effection';
import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from 'parcel-bundler';
import { Server } from 'http';
import { watch } from '@effection/events';
import { EventEmitter } from 'events';

interface ParcelServerOptions {
  port: number;
};

export function* createParcelServer(entryPoints: string[], options: ParcelServerOptions, parcelOptions?: ParcelOptions): Operation {
  let bundler: ParcelBundler = new Bundler(entryPoints, parcelOptions || {});

  yield watch(bundler, "buildEnd");

  let server = yield bundler.serve(options.port);

  if (process.send) {
    process.send({ type: "ready" });
  }

  try {
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
  serve(port: number): Promise<Server>;
  stop(): void;
}

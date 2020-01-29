import { Operation } from 'effection';
import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from 'parcel-bundler';
import { Server } from 'http';

interface ParcelServerOptions {
  port: number;
};

export function* createParcelServer(entryPoints: string[], options: ParcelServerOptions, parcelOptions?: ParcelOptions): Operation {
  let bundler: ParcelBundler = new Bundler(entryPoints, parcelOptions || {});
  let server = yield bundler.serve(options.port);

  if (process.send) {
    process.send({ type: "ready" });
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

import { monitor, Operation } from 'effection';
import { Mailbox, suspend, once } from '@bigtest/effection';

import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from  'parcel-bundler';
import { createServer, RequestListener } from 'http';
import { EventEmitter } from 'events';
import * as http from 'http';

interface ParcelServerOptions {
  port?: number;
};

export function* createParcelServer(entryPoints: string[], options: ParcelServerOptions, parcelOptions?: ParcelOptions): Operation {
  let bundler = new Bundler(entryPoints, parcelOptions || {}) as unknown as ParcelBundler;

  let events = yield Mailbox.subscribe(bundler, "buildEnd");

  let middleware = bundler.middleware();
  let server = createServer(middleware)

  try {
    if(options.port) {
      yield listen(server, options.port);
    }

    yield events.receive({ event: "buildEnd" });

    if (process.send) {
      process.send({ type: "ready", options: bundler.options });
    }

    while(true) {
      yield events.receive({ event: "buildEnd" });

      process.send({ type: "update" });
    }
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


function* listen(server: http.Server, port: number): Operation {
  yield suspend(monitor(function* errorListener() {
    let [error]: [Error] = yield once(server, "error");
    throw error;
  }));

  server.listen(port);
  yield once(server, "listening");
  return server;
}

import { Sequence } from 'effection';
import { createServer, IncomingMessage, Response } from './http';
import { Process } from './process';
import * as Bundler from 'parcel-bundler';
import { ParcelOptions } from 'parcel-bundler';

interface ParcelServerOptions {
  port: number;
};

export class ParcelServer extends Process {
  constructor(
    public entryPoints: string[],
    public serverOptions: ParcelServerOptions,
    public parcelOptions: ParcelOptions = {}
  ) {
    super();
  }

  protected *run(ready): Sequence {
    let bundler = new Bundler(this.entryPoints, this.parcelOptions);
    let server = yield bundler.serve(this.serverOptions.port);

    ready(server);

    try {
      yield;
    } finally {
      (bundler as any).stop();
      server.close();
    }
  }
}

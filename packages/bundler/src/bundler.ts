import { Operation } from 'effection';
import { once, on } from '@effection/events';
import { watch, RollupWatchOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import * as typescript from '@rollup/plugin-typescript';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import babel from '@rollup/plugin-babel';
import * as express from 'express';
import { Server } from 'http';
import * as path from 'path';
import { Mailbox, readyResource } from '@bigtest/effection';

export interface ServerOptions {
  port?: number;
};

export interface BundleOptions {
  entry: string;
  outDir?: string;
  outFile?: string;
  globalName?: string;
}

function prepareRollupOptions(bundles: Array<BundleOptions>): Array<RollupWatchOptions> {
  return bundles.map(bundle => {
    return {
      input: bundle.entry,
      output: {
        dir: bundle.outDir,
        file: bundle.outFile,
        name: bundle.globalName,
        sourcemap: true
      },
      watch: {
        exclude: ['node_modules/**']
      },
      plugins: [
        resolve(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        typescript({
          declaration: false,
        }),
        babel({ babelHelpers: 'bundled' })
      ]
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* waitForBuild(events: any) {
  while (true) {
    let event = yield events.next();
    let message = event.value[0];
    console.log(message);
    if (message.code === 'END') break;
    if (message.code === 'ERROR') throw message.error[0];
  }
}

export class Bundler {
  private mailbox: Mailbox = new Mailbox();

  static *create(bundles: Array<BundleOptions>, options?: ServerOptions): Operation {
    let bundler = new Bundler();
    let app = express();

    for (let { outDir, outFile } of bundles) {
      if (outDir) {
        app.use(express.static(outDir));
      } else if (outFile) {
        app.use(express.static(path.dirname(outFile)));
      }
    }

    return yield readyResource(bundler, function*(ready): Operation<void> {
      let rollup = watch(prepareRollupOptions(bundles));
      let events = yield on(rollup, 'event');
      let server: Server | null = null;

      try {
        yield waitForBuild(events);

        if (options?.port) {
          server = app.listen(options.port);
          yield once(app, "listening");
        }

        ready();

        while (true) {
          yield waitForBuild(events);
          bundler.mailbox.send({ type: 'update' });
        }
      } finally {
        rollup.close();
        if (server) {
          server.close();
        }
      }
    });
  }

  receive(pattern: unknown = undefined): Operation {
    return this.mailbox.receive(pattern);
  }
}

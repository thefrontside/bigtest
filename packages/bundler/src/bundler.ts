import { Operation } from 'effection';
import { on } from '@effection/events';
import { Subscribable } from '@effection/subscription';
import { watch, RollupWatchOptions, RollupWatcher, RollupWatcherEvent } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import * as commonjs from '@rollup/plugin-commonjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import babel from '@rollup/plugin-babel';
import { Mailbox, readyResource } from '@bigtest/effection';

export interface BundleOptions {
  entry: string;
  outFile: string;
  globalName?: string;
}

function prepareRollupOptions(bundles: Array<BundleOptions>, { mainFields }: { mainFields: string[] } = { mainFields: ["browser", "main"] }): Array<RollupWatchOptions> {
  return bundles.map(bundle => {
    return {
      input: bundle.entry,
      output: {
        file: bundle.outFile,
        name: bundle.globalName || undefined,
        globals: {
          "perf_hooks": "perf_hooks"
        },
        sourcemap: true,
        format: 'umd',
      },
      external: ['perf_hooks'],
      watch: {
        exclude: ['node_modules/**']
      },
      plugins: [
        resolve({
          mainFields,
          extensions: ['.js', '.ts']
        }),
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        commonjs(),
        babel({
          babelHelpers: 'runtime',
          extensions: ['.js', '.ts'],
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
          plugins: ['@babel/plugin-transform-runtime']
        })
      ]
    }
  });
}

function eventIs<T extends RollupWatcherEvent, S extends T>(event: T, code: 'ERROR' | 'END'): event is S {
  return event.code === code;
}

function* waitForBuild(rollup: RollupWatcher) {
  return yield Subscribable.from(on<Array<RollupWatcherEvent>>(rollup, 'event'))
    .map(([event]) => event)
    .filter(event => eventIs(event, 'END') || eventIs(event, 'ERROR'))
    .map(event => {
      if (eventIs(event, 'END')) return { type: 'update' };
      if (eventIs(event, 'ERROR')) return { type: 'error', error: (event as any).error };
      throw new Error('Please file a bug report and include this stack trace');
    }).first();
}

export class Bundler {
  private mailbox: Mailbox = new Mailbox();

  static *create(bundles: Array<BundleOptions>): Operation {
    let bundler = new Bundler();

    return yield readyResource(bundler, function*(ready): Operation<void> {
      let rollup = watch(prepareRollupOptions(bundles));

      try {
        bundler.mailbox.send(yield waitForBuild(rollup));
        ready();

        while (true) {
          bundler.mailbox.send(yield waitForBuild(rollup));
        }
      } finally {
        rollup.close();
      }
    });
  }

  receive(pattern: unknown = undefined): Operation {
    return this.mailbox.receive(pattern);
  }
}

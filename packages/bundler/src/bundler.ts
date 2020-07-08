import { Operation, resource } from 'effection';
import { on } from '@effection/events';
import { Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { watch, RollupWatchOptions, RollupWatcherEvent } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import * as commonjs from '@rollup/plugin-commonjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import babel from '@rollup/plugin-babel';

interface BundleOptions {
  entry: string;
  outFile: string;
  globalName?: string;
};

interface BundlerOptions {
  mainFields: Array<"browser" | "main">;
};

export interface BundlerError extends Error {
  frame: string;
};

export type BundlerMessage =
  | { type: 'update' }
  | { type: 'error'; error: BundlerError };

function prepareRollupOptions(bundles: Array<BundleOptions>, { mainFields }: BundlerOptions = { mainFields: ["browser", "main"] }): Array<RollupWatchOptions> {
  return bundles.map(bundle => {
    return {
      input: bundle.entry,
      output: {
        file: bundle.outFile,
        name: bundle.globalName || undefined,
        sourcemap: true,
        format: 'umd',
      },
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

export class Bundler implements Subscribable<BundlerMessage, undefined> {
  private channel = new Channel<BundlerMessage>();

  static *create(bundles: Array<BundleOptions>): Operation<Bundler> {
    let bundler = new Bundler();
    let rollup = watch(prepareRollupOptions(bundles));
    let events = Subscribable
      .from(on<Array<RollupWatcherEvent>>(rollup, 'event'))
      .map(([event]) => event)
      .filter(event => event.code === 'END' || event.code === 'ERROR')
      .map(event => event.code === 'ERROR' ? { type: 'error', error: event.error } : { type: 'update' });

    return yield resource(bundler, function*() {
      try {
        yield events.forEach(function*(message) {
          bundler.channel.send(message as BundlerMessage);
        });
      } finally {
        rollup.close();
      }
    });
  }

  [SymbolSubscribable]() {
    return this.channel[SymbolSubscribable]();
  }
}

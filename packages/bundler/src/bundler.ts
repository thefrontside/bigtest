import { Operation, resource } from 'effection';
import { on } from '@effection/events';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { watch, RollupWatchOptions, RollupWatcherEvent, RollupWatcher } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import { Slice } from '@bigtest/atom';
import { BundlerState } from './types';
import { assert } from '@bigtest/project';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import babel from '@rollup/plugin-babel';

interface BundleOptions {
  entry: string;
  outFile: string;
  globalName?: string;
};

interface BundlerOptions {
  mainFields: Array<"browser" | "main" | "module">;
};

function prepareRollupOptions(bundles: Array<BundleOptions>, bundlerSlice: Slice<BundlerState, unknown>, { mainFields }: BundlerOptions = { mainFields: ["browser", "module", "main"] }): Array<RollupWatchOptions> {
  return bundles.map(bundle => {
    return {
      input: bundle.entry,
      output: {
        file: bundle.outFile,
        name: bundle.globalName || undefined,
        sourcemap: true,
        format: 'umd',
      },
      onwarn(warning){
        console.log('we gottta warning!!!');
        console.dir(warning,)
        bundlerSlice.update(previous => {
          assert(previous.status === 'building', `in illegal bundler state ${previous.status}`);

          let warnings = previous.warnings ?? [];
          return ({ status: 'building', warnings: warnings.concat(warning) });
        })
      },
      watch: {
        // Rollup types are wrong; `watch.exclude` allows RegExp[]
        exclude: [/node_modules/ as unknown as string]
      },
      plugins: [
        resolve({
          mainFields,
          extensions: ['.js', '.ts']
        }),
        commonjs(),
        babel({
          babelHelpers: 'runtime',
          extensions: ['.js', '.ts'],
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
          plugins: ['@babel/plugin-transform-runtime']
        }),
        injectProcessEnv({
          NODE_ENV: 'production'
        }),
      ]
    }
  });
}

export class Bundler {
  static *create<S>(bundles: Array<BundleOptions>, bundlerSlice: Slice<BundlerState, S>): Operation<Bundler> {
    let bundler = new Bundler();

    return yield resource(bundler, function* () {
      let rollup: RollupWatcher = watch(prepareRollupOptions(bundles, bundlerSlice));

      try {
        let events: ChainableSubscription<RollupWatcherEvent[], void> = yield subscribe(on(rollup, 'event'));

        yield events
          .map(([event]) => event)
          .filter(event => ['END', 'ERROR'].includes(event.code))
          .forEach(function* (event) {
            if(event.code === 'ERROR'){
              bundlerSlice.update(() => ({ status: 'errored', error: event.error }));
            } else {
              bundlerSlice.update((previous) => {
                assert(previous.status === 'building', `bundler trying to transition to end from ${previous.status}`);

                console.debug('[bundler] finished building')

                return { status: 'end', warnings: previous.warnings };
              })
            }
          });
      } finally {
        rollup.close();
      }
    });
  }
}
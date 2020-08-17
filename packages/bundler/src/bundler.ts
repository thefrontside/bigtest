import { Operation, resource } from 'effection';
import { on } from '@effection/events';
import { subscribe, Subscribable, SymbolSubscribable, ChainableSubscription } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { watch, RollupWatchOptions, RollupWatcherEvent, RollupWatcher } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import babel from '@rollup/plugin-babel';
import { BundlerMessage } from './types';

interface BundleOptions {
  entry: string;
  outFile: string;
  globalName?: string;
};

interface BundlerOptions {
  mainFields: Array<"browser" | "main" | "module">;
};

function prepareRollupOptions(bundles: Array<BundleOptions>, channel: Channel<BundlerMessage>, { mainFields }: BundlerOptions = { mainFields: ["browser", "module", "main"] }): Array<RollupWatchOptions> {
  return bundles.map<RollupWatchOptions>(bundle => {
    return {
      input: bundle.entry,
      output: {
        file: bundle.outFile,
        name: bundle.globalName || undefined,
        sourcemap: true,
        format: 'umd',
      },
      onwarn(warning){
        channel.send({ type: 'WARN', warning })
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

export class Bundler implements Subscribable<BundlerMessage, undefined> {
  private channel = new Channel<BundlerMessage>();

  static *create(bundles: Array<BundleOptions>): Operation<Bundler> {
    let bundler = new Bundler();

    return yield resource(bundler, function* () {
      let rollup: RollupWatcher = watch(prepareRollupOptions(bundles, bundler.channel));

      try {
        let events: ChainableSubscription<RollupWatcherEvent[], BundlerMessage> = yield subscribe(on(rollup, 'event'));
   
        let messages = events
          .map(([event]) => event)
          .filter(event => ['START', 'END', 'ERROR'].includes(event.code))
          .map(event => {
            switch (event.code) {
              case 'START':
                return { type: 'START' } as const;
              case 'END':
                return { type: 'UPDATE' } as const;
              case 'ERROR':
                return { type: 'ERROR', error: event.error } as const;
              default: 
                throw new Error(`unexpect event ${event.code}`);
            }
          });
          
        yield messages.forEach(function* (message) {
          bundler.channel.send(message);
        });
      } finally {
        console.debug('[bundler] shutting down');
        rollup.close();
      }
    });
  }

  [SymbolSubscribable]() {
    return this.channel[SymbolSubscribable]();
  }
}
import { Operation, resource, timeout } from 'effection';
import { on } from '@effection/events';
import { Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { watch, rollup, OutputOptions, InputOptions, RollupWatchOptions, RollupWatcherEvent, RollupWatcher } from 'rollup';
import { defaultTSConfig } from '@bigtest/project';
import resolve, {
  DEFAULTS as RESOLVE_DEFAULTS,
} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import babel from '@rollup/plugin-babel';
import { BundlerMessage } from './types';
import { DEFAULT_EXTENSIONS } from '@babel/core';

interface BundleOptions {
  entry: string;
  outFile: string;
  globalName?: string;
  tsconfig?: string;
  watch?: boolean;
};

function prepareInputOptions(bundle: BundleOptions, channel: Channel<BundlerMessage>): InputOptions {
  return {
    input: bundle.entry,
    onwarn(warning){
      channel.send({ type: 'WARN', warning })
    },
    plugins: [
      resolve({
        mainFields: ["browser", "module", "main"],
        extensions: [...RESOLVE_DEFAULTS.extensions, '.jsx'],
      }),
      typescript({
        tsconfig: bundle.tsconfig,
        tsconfigDefaults: defaultTSConfig(),
        tsconfigOverride: {
          compilerOptions: {
            module: "ESNext",
          }
        }
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: /node_modules/,
        extensions: [
          ...DEFAULT_EXTENSIONS
        ],
        sourceType: 'unambiguous',
        presets: ['@babel/preset-env'],
        plugins: [
          ['@babel/plugin-transform-runtime']
        ]
      }),
      commonjs({
        ignoreGlobal: true,
      }),
      injectProcessEnv({
        NODE_ENV: 'production'
      }),
    ]
  }
}

function prepareOutputOptions(bundle: BundleOptions): OutputOptions {
  return {
    file: bundle.outFile,
    name: bundle.globalName || undefined,
    sourcemap: true,
    format: 'umd',
  }
}

function prepareWatchOptions(bundle: BundleOptions, channel: Channel<BundlerMessage>): RollupWatchOptions {
  return {
    ...prepareInputOptions(bundle, channel),
    output: prepareOutputOptions(bundle),
    watch: {
      // Rollup types are wrong; `watch.exclude` allows RegExp[]
      exclude: [/node_modules/ as unknown as string]
    },
  }
}

export class Bundler implements Subscribable<BundlerMessage, undefined> {
  private channel = new Channel<BundlerMessage>();

  static *create(options: BundleOptions): Operation<Bundler> {
    let bundler = new Bundler(options);

    if(options.watch) {
      return yield resource(bundler, bundler.watch());
    } else {
      return yield resource(bundler, bundler.build());
    }
  }

  constructor(public options: BundleOptions) {};

  [SymbolSubscribable]() {
    return this.channel[SymbolSubscribable]();
  }

  private *watch() {
    let { channel } = this;
    let rollup: RollupWatcher = watch(prepareWatchOptions(this.options, channel));

    try {
      let messages = on(rollup, 'event')
        .map(([event]) => event as RollupWatcherEvent)
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
        channel.send(message);
      });
    } catch(errr) {
      console.dir(errr)
    } 
    finally {
      console.debug('[bundler] shutting down');
      rollup.close();
    }
  }

  private *build() {
    yield timeout(0); // send start event asynchronously, so we have a chance to subscribe
    this.channel.send({ type: 'START' });
    try {
      let result = yield rollup(prepareInputOptions(this.options, this.channel));
      yield result.write(prepareOutputOptions(this.options));

      this.channel.send({ type: 'UPDATE' });
    } catch(error) {
      console.log(error)
      this.channel.send({ type: 'ERROR', error });
    }
  }
}

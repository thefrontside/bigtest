import { Operation, resource, timeout } from 'effection';
import { on } from '@effection/events';
import { Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { watch, rollup, OutputOptions, InputOptions, RollupWatchOptions, RollupWatcherEvent, RollupWatcher } from 'rollup';
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
    } finally {
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
      let message = error.message
      if(error.loc) {
        message += `\n\n${error.loc.file}:${error.loc.line}:${error.loc.column}`;
      }
      if(error.frame) {
        message += error.frame.trimEnd()
      }
      this.channel.send({ type: 'ERROR', error: { name: 'BundleError', message } });
    }
  }
}

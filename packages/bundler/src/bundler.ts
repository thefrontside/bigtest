import { Resource, spawn, ensure, sleep, createChannel, Stream, Channel } from 'effection';
import { on } from '@effection/events';
import { watch, rollup, OutputOptions, InputOptions, RollupWatchOptions, RollupWatcherEvent, RollupWatcher, RollupBuild } from 'rollup';
import { defaultTSConfig, jsTSConfig } from '@bigtest/project';
import resolve, {
  DEFAULTS as RESOLVE_DEFAULTS,
} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
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
  let hasTsConfig = typeof bundle.tsconfig !== 'undefined';

  return {
    input: bundle.entry,
    onwarn(warning){
      channel.send({ type: 'WARN', warning })
    },
    plugins: [
      resolve({
        mainFields: ["browser", "module", "main"],
        extensions: [...RESOLVE_DEFAULTS.extensions, '.ts', '.tsx', '.jsx'],
      }),
      json(),
      commonjs(),
      typescript({
        tsconfig: bundle.tsconfig,
        tsconfigDefaults: hasTsConfig ? defaultTSConfig() : jsTSConfig(),
        tsconfigOverride: {
          compilerOptions: {
            module: "ESNext",
          }
        }
      }),
      babel({
        babelHelpers: 'runtime',
        extensions: [
          ...DEFAULT_EXTENSIONS,
          '.ts',
          '.tsx'
        ],
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
      exclude: [/node_modules/]
    },
  }
}

export type Bundler = Stream<BundlerMessage>;

export function createBundler(options: BundleOptions): Resource<Bundler> {
  if(options.watch) {
    return createBundlerWatch(options);
  } else {
    return createBundlerBuild(options);
  }
}

export function createBundlerWatch(options: BundleOptions): Resource<Bundler> {
  return {
    *init() {
      let channel = createChannel<BundlerMessage>();
      let watcher: RollupWatcher = watch(prepareWatchOptions(options, channel));

      yield ensure(() => { watcher.close() });
      yield spawn(
        on<RollupWatcherEvent>(watcher, 'event')
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
          })
          .forEach(m => channel.send(m))
      )

      return channel.stream;
    }
  }
}
export function createBundlerBuild(options: BundleOptions): Resource<Bundler> {
  return {
    *init() {
      let channel = createChannel<BundlerMessage>();

      yield spawn(function*() {
        yield sleep(1); // send start event asynchronously, so we have a chance to subscribe

        channel.send({ type: 'START' });
        try {
          let result: RollupBuild = yield rollup(prepareInputOptions(options, channel));
          yield result.write(prepareOutputOptions(options));

          channel.send({ type: 'UPDATE' });
        } catch(error) {
          channel.send({ type: 'ERROR', error });
        }
      });
      return channel.stream;
    }
  }
}

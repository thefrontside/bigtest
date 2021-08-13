import { Operation } from 'effection';
import yargs, { Argv } from 'yargs';
import { ProjectOptions } from '@bigtest/project';
import { setLogLevel, Levels } from '@bigtest/logging';

import { startServer } from './start-server';
import { runTest } from './run-test';
import { init } from './init';

import { loadOptions, applyStartArgs, validateOptions } from './project-options';

export function* CLI(argv: string[]): Operation<void> {
  let args = parseArgs(argv);

  setLogLevel(args.logLevel);

  if (args.command === 'init') {
    yield init(args.configFile || './bigtest.json');
  } else if (args.command === 'test') {
    let options: ProjectOptions = yield loadOptions(args.configFile);
    yield runTest(options, args);
  } else if (args.command === 'server') {
    let options: ProjectOptions = yield loadOptions(args.configFile);
    applyStartArgs(options, args);
    validateOptions(options);
    yield startServer(options, {
      timeout: args.startTimeout,
    });
    yield;
  } else if (args.command === 'ci') {
    let options: ProjectOptions = yield loadOptions(args.configFile);
    applyStartArgs(options, args);
    options.watchTestFiles = false;
    validateOptions(options);
    yield startServer(options, {
      timeout: args.startTimeout,
    });
    yield runTest(options, args);
  }
}

export interface StartArgs {
  testFiles?: string[];
  launch?: string[];
  appUrl?: string;
  appCommand?: string;
  startTimeout: number;
  tsconfig?: string;
}

export interface RunArgs {
  coverage: boolean;
  formatter: string;
  files: string[];
  showFullStack: boolean;
  showLog: boolean;
}

export interface GlobalArgs {
  logLevel: Levels;
  configFile?: string;
}

type ServerCommandArgs = { command: 'server' } & StartArgs & GlobalArgs;
type TestCommandArgs = { command: 'test' } & RunArgs & GlobalArgs;
type CiCommandArgs = { command: 'ci' } & StartArgs & RunArgs & GlobalArgs;
type InitCommandArgs = { command: 'init' } & GlobalArgs;

export type Args = ServerCommandArgs | TestCommandArgs | CiCommandArgs | InitCommandArgs;

function parseArgs(argv: readonly string[]): Args {
  function startArgs(yargs: Argv) {
    return yargs
      .option('launch', {
        describe: 'launch specified driver at server startup',
        type: 'array',
      })
      .option('test-files', {
        describe: 'file globs which form the test suite',
        type: 'array'
      })
      .option('app-url', {
        describe: 'url of the target application',
        type: 'string',
      })
      .option('app-command', {
        describe: 'command to start the target application',
        type: 'string'
      })
      .option('tsconfig', {
        describe: 'the path to a tsconfig file to use for typescript compilation',
        type: 'string'
      })
      .option('start-timeout', {
        describe: 'duration to wait for BigTest server to start in milliseconds',
        type: 'number',
        default: 120000
      })
  };

  function runArgs(yargs: Argv) {
    return yargs
      .positional('files', {
        describe: 'the test files you would like to run',
      })
      .option('formatter', {
        alias: 'f',
        describe: 'specify the formatter which is used to format the output',
        type: 'string',
        default: 'checks'
      })
      .option('coverage', {
        describe: 'output coverage reports for the test run',
        type: 'boolean',
        default: false
      })
      .option('show-full-stack', {
        alias: 'b',
        describe: 'show the full stack including internals and source annotations',
        type: 'boolean',
        default: false
      })
      .option('show-log', {
        alias: 'l',
        describe: 'show console output from the application and tests',
        type: 'boolean',
        default: false
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed = yargs({} as any)
    .scriptName('bigtest')
    .option('log-level', {
      default: 'info',
      global: true,
      choices: ['debug', 'info', 'warn', 'error'],
      desc: 'increase or decrease the amount of logging information printed to the console'
    })
    .option('config-file', {
      alias: 'c',
      global: true,
      desc: 'the config file to use for bigtest'
    })
    .command('server', 'start a bigtest server', startArgs)
    .command('test [files...]', 'run tests against server', runArgs)
    .command('ci [files...]', 'start a server and run the test suite', (yargs) => runArgs(startArgs(yargs)))
    .command('init', 'interactively create a bigtest configuration file', (yargs) => yargs)
    .demandCommand()
    .help()
    .parse(argv)

  return { command: parsed._[0], ...parsed } as unknown as Args // types generated by yargs are inadequate
}

import { Operation } from 'effection';
import { defaultConfig, getConfigFilePath, loadConfigFile, ProjectOptions } from '@bigtest/project';
import merge from 'deepmerge';
import path from 'path';
import chalk from 'chalk';
import { StartArgs } from './cli';
import { MainError } from '@effection/node';

export function *loadOptions(filePath?: string): Operation<ProjectOptions> {
  let resolvedPath = filePath || getConfigFilePath();
  if(!resolvedPath) {
    throw new MainError({
      exitCode: 1,
      message: chalk.red('Unable to find a bigtest configuration file, run `bigtest init` to create one')
    });
  }

  let projectConfig: ProjectOptions;
  try {
    projectConfig = yield loadConfigFile(path.resolve(resolvedPath));
  } catch(error) {
    throw new MainError({ exitCode: 1, message: chalk.red(error.message) });
  }

  return merge(defaultConfig(resolvedPath), projectConfig, {
    arrayMerge: (_a, b) => b
  });
}

export function applyStartArgs(options: ProjectOptions, args: StartArgs): void {
  if(args.launch) {
    options.launch = args.launch;
  }
  if(args.testFiles) {
    options.testFiles = args.testFiles;
  }
  if(args.appCommand != null) {
    options.app.command = args.appCommand;
  }
  if(args.appUrl != null) {
    options.app.url = args.appUrl;
  }
  if(args.tsconfig != null) {
    options.tsconfig = args.tsconfig;
  }
}

export function validateOptions(options: ProjectOptions): void {
  if (!options.app?.url) {
    throw new MainError({
      exitCode: 1,
      message: chalk.red('CONFIGURATION ERROR: App url is not set. BigTest needs to know how to reach your application, please set `"app": { "url": ... }` in your configuration file')
    });
  }
  for (let key of options.launch) {
    if (!options.drivers[key]) {
      let alternatives = Object.keys(options.drivers).map((d) => JSON.stringify(d));
      throw new MainError({
        exitCode: 1,
        message: chalk.red(`CONFIGURATION ERROR: Unable to launch agent with driver ${JSON.stringify(key)}, did you mean one of: ${alternatives.join(', ')}`)
      });
    }
  }
}

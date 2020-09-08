import { Operation } from 'effection';
import { defaultConfig, getConfigFilePath, loadConfigFile, ProjectOptions } from '@bigtest/project';
import * as merge from 'deepmerge';
import { CLIArguments } from './cli';
import { MainError } from '@effection/node';

export function *loadConfig(args: CLIArguments): Operation<ProjectOptions> {
  let configFilePath = getConfigFilePath();
  if(!configFilePath) { throw new Error("config file not found"); }

  let projectConfig: ProjectOptions = yield loadConfigFile(configFilePath);

  let config = merge(defaultConfig(configFilePath), projectConfig, {
    arrayMerge: (_a, b) => b
  });

  if(args.launch) {
    config.launch = args.launch;
  }
  if(args.testFiles) {
    config.testFiles = args.testFiles;
  }

  yield validateConfig(config);

  return config;
}

export function *validateConfig(config: ProjectOptions) {
  for (let key of config.launch) {
    if (!config.drivers[key]) {
      let alternatives = Object.keys(config.drivers).map((d) => JSON.stringify(d));
      throw new MainError({
        exitCode: 1,
        message: `Unable to launch agent with driver ${JSON.stringify(key)}, did you mean one of: ${alternatives.join(', ')}`
      });
    }
  }
}

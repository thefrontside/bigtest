import { Operation } from 'effection';
import { defaultConfig, getConfigFilePath, loadConfigFile, ProjectOptions } from '@bigtest/project';
import * as merge from 'deepmerge';
import { Options } from './cli';
import { MainError } from '@effection/node';

export function *loadConfig(args: Options): Operation<ProjectOptions> {
  let configFilePath = getConfigFilePath();
  if(!configFilePath) { throw new Error("config file not found"); }

  let projectConfig: ProjectOptions = yield loadConfigFile(configFilePath);

  let config = merge(defaultConfig(configFilePath), projectConfig, {
    arrayMerge: (_a, b) => b
  });

  if(args.command === 'server' || args.command === 'ci') {
    if(args.launch) {
      config.launch = args.launch;
    }
    if(args.testFiles) {
      config.testFiles = args.testFiles;
    }
    if(args.appCommand) {
      config.app.command = args.appCommand;
    }
    if(args.appUrl) {
      config.app.url = args.appUrl;
    }
  }

  yield validateConfig(config);

  return config;
}

export function *validateConfig(config: ProjectOptions) {
  if (!config.app?.url) {
    throw new MainError({
      exitCode: 1,
      message: 'CONFIGURATION ERROR: App url is not set. BigTest needs to know how to reach your application, please set `"app": { "url": ... }` in your configuration file'
    });
  }
  for (let key of config.launch) {
    if (!config.drivers[key]) {
      let alternatives = Object.keys(config.drivers).map((d) => JSON.stringify(d));
      throw new MainError({
        exitCode: 1,
        message: `CONFIGURATION ERROR: Unable to launch agent with driver ${JSON.stringify(key)}, did you mean one of: ${alternatives.join(', ')}`
      });
    }
  }
}

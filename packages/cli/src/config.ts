import { Operation } from 'effection';
import { defaultConfig, getConfigFilePath, loadConfigFile, ProjectOptions } from '@bigtest/project';
import * as merge from 'deepmerge';

export function *loadConfig(): Operation<ProjectOptions> {
  let configFilePath = getConfigFilePath();
  if(!configFilePath) { throw new Error("config file not found"); }

  let projectConfig: ProjectOptions = yield loadConfigFile(configFilePath);

  let config = merge(defaultConfig(configFilePath), projectConfig, {
    arrayMerge: (_a, b) => b
  });

  yield validateConfig(config);

  return config;
}

export function *validateConfig(config: ProjectOptions) {
  for (let key of config.launch) {
    if (!config.drivers[key]) {
      throw new Error(`Could not find launch key ${key} in the set of drivers: ${JSON.stringify(Object.keys(config.drivers))}`);
    }
  }
}

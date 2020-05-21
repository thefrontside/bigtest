import { Operation } from 'effection';
import { defaultConfig, getConfigFilePath, loadConfigFile, ProjectOptions } from '@bigtest/project';
import * as merge from 'deepmerge';

export function *loadConfig(): Operation<ProjectOptions> {
  let configFilePath = getConfigFilePath();
  if(!configFilePath) { throw new Error("config file not found"); }

  let projectConfig: ProjectOptions = yield loadConfigFile(configFilePath);

  return merge(defaultConfig(configFilePath), projectConfig, {
    arrayMerge: (_a, b) => b
  });
}

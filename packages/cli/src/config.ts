import { Operation } from 'effection';
import { getConfigFilePath, loadConfigFile, ProjectOptions } from '@bigtest/project';
import * as path from 'path';
import * as merge from 'deepmerge';

export function *loadConfig(): Operation<ProjectOptions> {
  let configFilePath = getConfigFilePath();
  if(!configFilePath) { throw new Error("config file not found"); }

  let projectConfig: ProjectOptions = yield loadConfigFile(configFilePath);
  let defaultConfig: ProjectOptions = {
    port: 24002,
    app: {
      command: "yarn start",
      args: [],
      env: { PORT: "24000" },
      port: 24000,
    },
    proxy: {
      port: 24001,
    },
    connection: {
      port: 24003,
    },
    agent: {
      port: 24004,
    },
    manifest: {
      port: 24005,
    },
    testFiles: ["./test/**/*.test.{ts,js}"],
    cacheDir: path.resolve(path.dirname(configFilePath), '.bigtest'),
  }

  return merge(defaultConfig, projectConfig);
}

import { Operation } from 'effection';
import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs';

const CONFIG_FILE_NAME = 'bigtest.json';

const { readFile } = fs.promises;

export function getConfigFilePath(): string | undefined {
  let dir = process.cwd();
  do {
    let configFilePath = path.resolve(dir, CONFIG_FILE_NAME);
    if(existsSync(configFilePath)) {
      return configFilePath;
    }
    dir = path.resolve(dir, '..');
  } while(dir !== '/');
}

export function *loadConfigFile(configFilePath: string): Operation<ProjectOptions> {
  let contents = yield readFile(configFilePath);
  return JSON.parse(contents) as ProjectOptions;
}

export type ProjectOptions = {
  port: number;
  testFiles: [string];
  cacheDir: string;
  app: {
    port: number;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    dir?: string;
  };
  proxy: {
    port: number;
  };
  agent: {
    port: number;
  };
  connection: {
    port: number;
  };
  manifest: {
    port: number;
  };
}

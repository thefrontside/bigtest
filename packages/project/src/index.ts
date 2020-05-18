import { Operation } from 'effection';
import { Options as WebDriverOptions } from '@bigtest/webdriver';
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
  testFiles: string[];
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
  drivers: Record<string, WebDriverOptions>;
  launch: string[];
}

export function defaultConfig(configFilePath: string): ProjectOptions {
  return {
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
    drivers: {
      chrome: {
        browserName: "chrome",
        headless: false
      },
      "chrome.headless": {
        browserName: "chrome",
        headless: true
      },
      firefox: {
        browserName: "firefox",
        headless: false
      },
      "firefox.headless": {
        browserName: "firefox",
        headless: true
      },
      "safari": {
        browserName: "safari",
        headless: false
      },
    },
    launch: []
  }
};

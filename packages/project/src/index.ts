import { Operation } from 'effection';
import { DriverSpec } from '@bigtest/driver';
import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs';
import type { CompilerOptions } from 'typescript';
import { ScriptTarget } from 'typescript';

const { readFile } = fs.promises;

export function getConfigFilePath(fileName = 'bigtest.json'): string | undefined {
  let dir = process.cwd();
  do {
    let configFilePath = path.resolve(dir, fileName);
    if(existsSync(configFilePath)) {
      return configFilePath;
    }
    dir = path.resolve(dir, '..');
  } while(dir !== '/');
}

export function* loadConfigFile(configFilePath: string): Operation<ProjectOptions> {
  let contents = yield readFile(configFilePath);
  return JSON.parse(contents) as ProjectOptions;
}

export type CoverageReportName =
  'clover' |
  'cobertura' |
  'html-spa' |
  'html' |
  'json' |
  'json-summary' |
  'lcov'|
  'lcovonly' |
  'teamcity';

export type ProjectOptions = {
  port: number;
  testFiles: string[];
  cacheDir: string;
  watchTestFiles: boolean;
  tsconfig?: string;
  app: {
    url?: string;
    command?: string;
    env?: Record<string, string>;
    dir?: string;
  };
  proxy: {
    port: number;
    prefix: string;
  };
  connection: {
    port: number;
  };
  manifest: {
    port: number;
  };
  drivers: Record<string, DriverSpec>;
  launch: string[];
  coverage: {
    reports: CoverageReportName[];
    directory: string;
  };
}

export function defaultConfig(configFilePath: string): ProjectOptions {
  return {
    port: 24002,
    app: {
    },
    proxy: {
      port: 24001,
      prefix: '/__bigtest/'
    },
    connection: {
      port: 24003,
    },
    manifest: {
      port: 24005,
    },
    testFiles: ["./test/**/*.test.{ts,js}"],
    cacheDir: path.resolve(path.dirname(configFilePath), '.bigtest'),
    watchTestFiles: true,
    drivers: {
      default: {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          headless: true
        }
      },
      chrome: {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "chrome",
          headless: false
        }
      },
      "chrome.headless": {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "chrome",
          headless: true
        }
      },
      firefox: {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "firefox",
          headless: false
        }
      },
      "firefox.headless": {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "firefox",
          headless: true
        }
      },
      edge: {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "edge",
          headless: false
        }
      },
      "edge.headless": {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "edge",
          headless: true
        }
      },
      "safari": {
        module: "@bigtest/webdriver",
        options: {
          type: 'local',
          browserName: "safari",
          headless: false
        }
      },
    },
    launch: [],
    coverage: {
      reports: [],
      directory: "./coverage"
    }
  }
};

export function defaultTSConfig(): {compilerOptions: Pick<CompilerOptions, 'skipLibCheck' | 'target' | 'lib'>} {
  return {
    compilerOptions: {
      skipLibCheck: true,
      target: "es6" as unknown as ScriptTarget,
      lib: ["esnext", "dom"],
    }
  }
}

export function jsTSConfig(): {compilerOptions: Pick<CompilerOptions, 'allowJs' | 'skipLibCheck' | 'target'>} {
  return {
    compilerOptions: {
      allowJs: true,
      skipLibCheck: true,
      target: "es5" as unknown as ScriptTarget,
    }
  }
}

import { main } from '@effection/node';
import { setLogLevel, Levels } from '@bigtest/logging';

import { createServer } from '../src/index';

setLogLevel(process.env.LOG_LEVEL as Levels || 'info');

main(createServer({
  port: 24002,
  app: {
    url: "http://localhost:24000",
    command: "yarn test:app:start 24000",
    env: {},
  },
  proxy: {
    publicUrl: "http://localhost:24001",
    port: 24001,
  },
  connection: {
    publicUrl: "ws://localhost:24003",
    port: 24003,
  },
  manifest: {
    publicUrl: "http://localhost:24005",
    port: 24005,
  },
  testFiles: ["./test/fixtures/*.t.js"],
  cacheDir: "./tmp/start",
  watchTestFiles: true,
  drivers: {
    chrome: {
      module: "@bigtest/webdriver",
      options: {
        browserName: "chrome",
        headless: false
      }
    },
    "chrome.headless": {
      module: "@bigtest/webdriver",
      options: {
        browserName: "chrome",
        headless: true
      }
    },
    firefox: {
      module: "@bigtest/webdriver",
      options: {
        browserName: "firefox",
        headless: false
      }
    },
    "firefox.headless": {
      module: "@bigtest/webdriver",
      options: {
        browserName: "firefox",
        headless: true
      }
    },
    "safari": {
      module: "@bigtest/webdriver",
      options: {
        browserName: "safari",
        headless: false
      }
    }
  },
  launch: ['chrome.headless', 'firefox.headless']
}));

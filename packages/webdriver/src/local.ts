import 'chromedriver';
import 'geckodriver';

import { Operation, resource } from 'effection';
import { daemon } from '@effection/node';

import { findAvailablePortNumber } from './find-available-port-number';
import { untilURLAvailable } from './until-url-available';
import { WebDriver, LocalOptions, BrowserName, connect, parseBrowserName } from './web-driver';

/**
 * Create a local `WebDriver` resource based on `driverName` (either 'geckodriver' or
 * 'chromedriver').
 *
 * In order to function, the local executables for `Chrome` and
 * `Firefox` must be separately installed onto the machine. So in CI
 * for example, you would need to make sure that the browsers are
 * present on your container.
 *
 * In order to keep things simple, and because the geckodriver only
 * suopports a single Firefox session per driver process, we spawn a
 * new process for each local driver.
 */
export function * Local(options: LocalOptions): Operation<WebDriver> {
  let port: number = yield findAvailablePortNumber();
  let driverURL = `http://localhost:${port}`;

  let bin = yield getDriverPath(parseBrowserName(options.browserName));

  let driver = yield resource(new WebDriver(driverURL), function*() {
    yield daemon(`${bin} --port=${port}`);

    yield;
  });

  yield untilURLAvailable(`${driverURL}/status`);

  yield connect(driver, options);

  return driver;
}

type DriverInfo = {
  path: string;
}

export function *getDriverPath(browserName: BrowserName): Operation<DriverInfo> {
  let path;
  if (browserName === 'edge') {
    let { installDriver } = yield import('ms-chromium-edge-driver');
    let edgePaths = yield installDriver();
    path = edgePaths.driverPath
  } else if(browserName === 'firefox') {
    path = (yield import('geckodriver')).path
  } else if(browserName === 'chrome') {
    path = (yield import('chromedriver')).path
  } else if(browserName === 'safari') {
    path = 'safaridriver'; // always installed in $PATH on macOS
  }
  return path.replace(/\\/g, '/');
}

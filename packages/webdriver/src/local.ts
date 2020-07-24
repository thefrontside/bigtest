import 'chromedriver';
import 'geckodriver';

import { Operation, resource } from 'effection';
import { ChildProcess } from '@effection/node';
import { once } from '@effection/events';

import { findAvailablePortNumber } from './find-available-port-number';
import { untilURLAvailable } from './until-url-available';
import { WebDriver, Options, connect } from './web-driver';

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
export function * Local(options: Options): Operation<WebDriver> {

  let driverName = driverNameFor(options.browserName);

  let port: number = yield findAvailablePortNumber();
  let driverURL = `http://localhost:${port}`;

  let driver = yield resource(new WebDriver(driverURL), function*() {
    let child = yield ChildProcess.spawn(driverName, [`--port=${port}`]);
    yield once(child, 'exit');
  });

  yield untilURLAvailable(`${driverURL}/status`, 5000);

  yield connect(driver, options);

  return driver;
}

function driverNameFor(browserName: Options["browserName"]) {
  if (browserName == 'firefox') {
    return 'geckodriver';
  } else {
    return `${browserName}driver`;
  }
}

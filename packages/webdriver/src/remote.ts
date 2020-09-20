import 'chromedriver';
import 'geckodriver';

import { Operation } from 'effection';
import { untilURLAvailable } from './until-url-available';
import { WebDriver, RemoteOptions, connect } from './web-driver';

export function * Remote(options: RemoteOptions): Operation<WebDriver> {
  let driver = new WebDriver(options.driverUrl);

  yield untilURLAvailable(`${options.driverUrl}/status`, 5000);
  yield connect(driver, options);

  return driver;
}

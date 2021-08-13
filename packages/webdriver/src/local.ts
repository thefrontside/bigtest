import 'chromedriver';
import 'geckodriver';

import { Operation } from 'effection';
import { BrowserName } from './web-driver';

export function getDriverPath(browserName: BrowserName): Operation<string> {
  return function*() {
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
}

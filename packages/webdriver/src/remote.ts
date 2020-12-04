import { Operation, resource, main } from 'effection';

import { WebDriver, RemoteOptions, connect, disconnect } from './web-driver';

export function* Remote(options: RemoteOptions): Operation<WebDriver> {
  let driver = new WebDriver(options.url);

  yield connect(driver, options);

  return yield resource(driver, function*() {
    try {
      yield;
    } finally {
      // async shutdown not supported yet!
      // so we have to start a new effection tree
      main(disconnect(driver))
        .catch(error => {
          console.error('WARNING: failed to disconnect web driver session');
          console.error(error);
        });
    }
  });
}

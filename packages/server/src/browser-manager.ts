import { Operation, resource } from 'effection';
import { Deferred } from '@bigtest/effection';
import { Local, Options as WebDriverOptions, WebDriver } from '@bigtest/webdriver';

interface CreateOptions {
  connectURL: string;
  drivers: Record<string, WebDriverOptions>;
  launch: string[];
}

export interface BrowserManager {
  ready(): Operation<void>;
}

export function* createBrowserManager(options: CreateOptions): Operation<BrowserManager> {

  let ready = Deferred<void>();

  let manager: BrowserManager = {
    *ready() { yield ready.promise; }
  }

  return yield resource(manager, function*() {

    for (let launch of options.launch) {
      let driver: WebDriver = yield Local(options.drivers[launch]);
      yield driver.navigateTo(options.connectURL);
    }

    ready.resolve();

    yield;
  })

}

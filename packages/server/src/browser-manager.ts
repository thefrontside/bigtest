import { Operation, resource } from 'effection';
import { Deferred } from '@bigtest/effection';
import { Local, Options as WebDriverOptions, WebDriver } from '@bigtest/webdriver';

interface CreateOptions {
  connectURL: string;
  drivers: Record<string, WebDriverOptions>;
  launch: Record<string, Partial<WebDriverOptions>>;
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
    let launches = Object.keys(options.launch)
      .map(key => Object.assign({}, options.drivers[key], options.launch[key]) as WebDriverOptions);

    for (let launch of launches) {
      let driver: WebDriver = yield Local(launch);
      yield driver.navigateTo(options.connectURL);
    }

    ready.resolve();

    yield;
  })

}

import { Operation, resource } from 'effection';
import { Driver, DriverFactory } from '@bigtest/driver';
import playwright, { Browser, Page } from 'playwright';


interface Options {
  browser: 'chromium' | 'webkit' | 'firefox';
  headless?: boolean;
}

export const create: DriverFactory<Options, Options> = function* create({ options }): Operation<Driver<Options>> {
  let headless = typeof options.headless === 'undefined' ?  true : options.headless;
  let browser: Browser = yield playwright[options.browser].launch( { headless });

  let driver: Driver<Options> = {
    description: `playwright<${options}>`,
    data: options,
    *connect(agentURL: string) {
      let page: Page = yield browser.newPage();
      page.goto(agentURL);
    }
  }

  return yield resource(driver, function*() {
    try {
      yield
    } finally {
      browser.close();
    }
  })
}

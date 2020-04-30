# @bigtest/webdriver

Connect and Control webdrivers for BigTest

BigTest needs a way to automatically start and stop web browsers and
connect them to the orchestrator as agents. It does this my getting
references to `WebDriver` instances that can be used to control a
browser.

`WebDriver` instances are implemented as effection resources, and so
they will automatically be shut down whenever the operation of which
they are a part passes out of scope.

In order to start a local webdriver on the current computer:

``` typescript
import { Operation } from 'effection';
import { WebDriver, Local } from '@bigtest/webdriver';

export function* connect(url: string): Operation<WebDriver> {
  // get the instance of the driver
  let driver: WebDriver = yield Local('chromedriver', { headless: true });

  // use it to got to a web page
  yield driver.navigateTo('https://frontside.com');

  // pass the driver resource to the caller
  return driver;
}
```

> Currently, only _local_ webdriver instances of `chromedriver` and
> `geckodriver` are supported and so in order to use them you must
> have Chrome and Firefox installed locally.

To run the tests:

``` sh
$ yarn test
```

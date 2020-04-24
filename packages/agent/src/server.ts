import { Operation, resource } from 'effection';
import * as xp from 'express';
import * as Path from 'path';
import { Server } from 'http';
import { ensure } from '@bigtest/effection';

import 'chromedriver';
import 'geckodriver';
import { WebDriver, Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome'
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox'

interface Options {
  port: number;
  externalURL?: string;
}

interface LaunchOptions {
  browser: 'chrome' | 'firefox';
  connectBackURL: string;
  headless: boolean;
}

export class AgentServer {

  protected constructor(public url: string, protected appDir: string) {}

  static create(options: Options, appDir = Path.join(__dirname, '../app')) {
    if (options.externalURL) {
      return new AgentServer(options.externalURL, appDir);
    } else {
      if (!options.port) {
        throw new Error('An agent server must be created with either an external url or a port number');
      }
      return new HttpAgentServer(options.port, appDir);
    }
  }

  connectURL(connectBackURL: string) {
    return `${this.url}/?connectTo=${encodeURIComponent(connectBackURL)}`;
  }

  get harnessScriptURL() {
    return `${this.url}/harness.js`;
  }

  *listen(): Operation { return; }

  *join(): Operation { yield; }

  *launch(options: LaunchOptions): Operation<WebDriver> {
    let driver: WebDriver = yield buildDriver(options);

    yield driver.get(this.connectURL(options.connectBackURL));

    return yield resource(driver, ensure(() => driver.quit().catch(e => e)))
  }
}

class HttpAgentServer extends AgentServer {
  http?: Server;
  constructor(private port: number, appDir: string) {
    super(`http://localhost:${port}`, appDir);
  }

  *listen() {
    let express = xp;
    let app = express()
      .use(express.static(this.appDir));

    let server: Server = yield listen(app, this.port);
    this.http = server;

    return yield resource(server, ensure(() => server.close()));
  }

  join(): Operation {
    return ({ resume, ensure }) => {
      if (this.http) {
        this.http.on('close', resume);
        ensure(() => this.http.off('close', resume));
      } else {
        throw new Error('cannot join a server that is not already listening');
      }
    }
  }

}

function listen(app: xp.Express, port?: number): Operation {
  return ({ resume, fail }) => {
    let server = app.listen(port, (err) => {
      if (err) {
        fail(err);
      } else {
        resume(server);
      }
    })
  };
};

function buildDriver({ browser, headless }: LaunchOptions): Promise<WebDriver> {
  let builder = new Builder().forBrowser(browser);
  switch (browser) {
    case 'chrome':
      let chromeOptions = new ChromeOptions();
      chromeOptions = headless ? chromeOptions.headless() : chromeOptions;
      return builder.setChromeOptions(chromeOptions).build();
    case 'firefox':
      let firefoxOptions = new FirefoxOptions();
      firefoxOptions = headless ? firefoxOptions.headless() : firefoxOptions;
      return builder.setFirefoxOptions(firefoxOptions).build();
  }
}

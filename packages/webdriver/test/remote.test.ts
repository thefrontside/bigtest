import { describe, it, beforeEach } from '@effection/mocha';
import { daemon } from '@effection/process';
import { express, Express } from '@bigtest/effection-express';
import { Request, Response } from 'express';
import expect from 'expect';

import { findAvailablePortNumber } from '../src/find-available-port-number';
import { untilURLAvailable } from '../src/until-url-available';

import { WebDriver, createWebDriver, parseBrowserName } from '../src/index';
import { getDriverPath } from '../src/local';

const BROWSER = parseBrowserName(process.env.BROWSER);

describe('Connecting to a remote webdriver', () => {
  let server: Express;
  let latestRequest: Request;

  let serverURL: string;

  beforeEach(function*() {
    server = yield express();
    server.raw.use(function(request: Request, response: Response) {
      latestRequest = request;
      response.write("thank you");
      response.end();
    });

    latestRequest = serverURL = undefined;

    let port = yield findAvailablePortNumber();

    serverURL = `http://localhost:${port}`;

    yield server.listen(port);
  });

  let driver: WebDriver;
  let driverURL: string;

  beforeEach(function*() {
    let port = yield findAvailablePortNumber();
    driverURL = `http://localhost:${port}`;

    let bin = yield getDriverPath(BROWSER);
    yield daemon(`${bin} --port=${port}`);

    yield untilURLAvailable(`${driverURL}/status`);

    driver = yield createWebDriver({ type: 'remote', url: driverURL, headless: true });
    yield driver.connect(serverURL);
  });

  it('can navigate to a url', function*() {
    expect(latestRequest).toBeDefined();
    expect(latestRequest.headers['user-agent']).toMatch('Mozilla');
  });
});

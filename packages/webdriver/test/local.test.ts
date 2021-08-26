import { describe, it, beforeEach } from '@effection/mocha';
import expect from 'expect'

import { express, Express } from '@bigtest/effection-express';
import { Request, Response } from 'express';

import { createWebDriver, WebDriver } from '../src/index';
import { findAvailablePortNumber } from '../src/find-available-port-number';

describe("Running a local wedriver", () => {
  let driver: WebDriver;
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
    latestRequest = undefined;

    let port = yield findAvailablePortNumber();

    serverURL = `http://localhost:${port}`;

    yield server.listen(port);
  });

  if (process.platform === 'win32') {
    describe('with edgedriver', () => {
      beforeEach(function*() {
        driver = yield createWebDriver({ type: 'local', browserName: 'edge', headless: true });
        yield driver.connect(serverURL);
      });

      it('can navigate to a url', function*() {
        expect(latestRequest).toBeDefined();
        expect(latestRequest.headers['user-agent']).toMatch('Chrome');
      });
    });
  } else {
    describe('with chromedriver', () => {
      beforeEach(function*() {
        driver = yield createWebDriver({ type: 'local', browserName: 'chrome', headless: true });
        yield driver.connect(serverURL);
      });

      it('can navigate to a url', function*() {
        expect(latestRequest).toBeDefined();
        expect(latestRequest.headers['user-agent']).toMatch('Chrome');
      });
    });

    describe('with geckodriver', () => {
      beforeEach(function*() {
        driver = yield createWebDriver({ type: 'local', browserName: 'firefox', headless: true });
        yield driver.connect(serverURL);
      });

      it('can navigate to a url', function*() {
        expect(latestRequest).toBeDefined();
        expect(latestRequest.headers['user-agent']).toMatch('Firefox');
      });
    });
  }
})

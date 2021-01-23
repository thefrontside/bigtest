import { describe, it } from 'mocha';
import expect from 'expect'

import { express } from '@bigtest/effection-express';
import { Request, Response } from 'express';
import { spawn } from './helpers';

import { create } from '../src/index';

describe("Running a local wedriver", () => {
  let server = express();
  let latestRequest: Request;
  server.raw.use(function(request: Request, response: Response) {
    latestRequest = request;
    response.write("thank you");
    response.end();
  });

  let serverURL: string;

  beforeEach(async () => {
    latestRequest = undefined;

    let port = await spawn(findAvailablePortNumber());

    serverURL = `http://localhost:${port}`;

    await spawn(server.listen(port));

  });

  describe('with chromedriver', () => {
    beforeEach(async () => {
      driver = await spawn(Local({ type: 'local', browserName: 'chrome', headless: true }));
      await spawn(driver.navigateTo(serverURL));
    });

    it('can navigate to a url', () => {
      expect(latestRequest).toBeDefined();
      expect(latestRequest.headers['user-agent']).toMatch('Chrome');
    });
  });

  if (process.platform !== 'win32') {
    describe('with geckodriver', () => {
      beforeEach(async () => {
        driver = await spawn(Local({ type: 'local', browserName: 'firefox', headless: true }));
        await spawn(driver.navigateTo(serverURL));
      });

      it('can navigate to a url', () => {
        expect(latestRequest).toBeDefined();
        expect(latestRequest.headers['user-agent']).toMatch('Firefox');
      });
    });
  }
})

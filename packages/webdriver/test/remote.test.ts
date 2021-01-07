import { describe } from 'mocha';
import { Context, main } from 'effection';
import { daemon } from '@effection/node';
import { express } from '@bigtest/effection-express';
import { Request, Response } from 'express';
import expect from 'expect';

import { spawn } from './helpers';
import { findAvailablePortNumber } from '../src/find-available-port-number';
import { untilURLAvailable } from '../src/until-url-available';

import { converge } from '../../interactor/src/converge';
import { WebDriver, Remote } from '../src/index';

describe('Connecting to a remote webdriver', () => {
  let server = express();
  let latestRequest: Request;

  server.raw.use(function(request: Request, response: Response) {
    latestRequest = request;
    response.write("thank you");
    response.end();
  });

  let serverURL: string;

  beforeEach(async () => {
    latestRequest = serverURL = undefined;

    let port = await spawn(findAvailablePortNumber());

    serverURL = `http://localhost:${port}`;

    await spawn(server.listen(port));

  });

  let driver: WebDriver;
  let driverURL: string;
  let driverProcessContext: Context;

  // this is another annoying thing about not having
  // async teardown in effection. the chromedriver process
  // resource is shutdown while still responding to the session shutdwon
  // request. This uses a separate effection context for the driver
  // process and then adds an afterEach hook to tear it down only after
  // the remote webdriver resource is no longer active.
  // it's a hack.

  beforeEach(async () => {
    let port = await spawn(findAvailablePortNumber());
    driverURL = `http://localhost:${port}`;

    driverProcessContext = main(function*() {
      yield daemon(`chromedriver --port=${port}`);
      yield;
    });
  });

  afterEach(async () => {
    if (driver) {
      await converge(() => expect(driver.active).toBe(false));
    }
    driverProcessContext.halt();
  });


  beforeEach(async () => {
    await spawn(function*() {
      yield untilURLAvailable(`${driverURL}/status`);
      driver = yield Remote({ type: 'remote', url: driverURL, headless: true });
      yield driver.navigateTo(serverURL);
    });
  });

  it('can navigate to a url', () => {
    expect(latestRequest).toBeDefined();
    expect(latestRequest.headers['user-agent']).toMatch('Chrome');
  });
});

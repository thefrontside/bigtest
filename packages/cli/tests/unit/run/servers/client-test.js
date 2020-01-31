import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect, request } from '@tests/helpers';

import WebServer from '@run/servers/web';
import ClientServer from '@run/servers/client';

describe('Unit: ClientServer', () => {
  let test;

  beforeEach(async () => {
    test = new ClientServer();
    await test.start();
  });

  afterEach(async () => {
    await test.stop();
  });

  it('is an instance of WebServer', () => {
    expect(test).to.be.an.instanceof(WebServer);
  });

  it('responds to requests', async () => {
    await expect(request(test.url)).to.eventually
      .have.property('statusCode', 200);
  });
});

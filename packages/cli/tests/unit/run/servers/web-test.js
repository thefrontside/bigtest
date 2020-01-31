import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect, request } from '@tests/helpers';

import WebServer from '@run/servers/web';

describe('Unit: WebServer', () => {
  let test;

  beforeEach(() => {
    test = new WebServer();
  });

  afterEach(async () => {
    if (test.running) {
      await test.stop();
    }
  });

  it('has default hostname and port options', () => {
    expect(test.hostname).to.equal('localhost');
    expect(test.port).to.equal(3000);
  });

  it('has a computed url from hostname and port options', () => {
    expect(test.url).to.equal('http://localhost:3000');

    test = new WebServer({ hostname: '127.0.0.1', port: 8888 });

    expect(test.hostname).to.equal('127.0.0.1');
    expect(test.port).to.equal(8888);
    expect(test.url).to.equal('http://127.0.0.1:8888');
  });

  describe('starting', () => {
    it('indicates it is running', async () => {
      expect(test.running).to.be.false;
      await test.start();
      expect(test.running).to.be.true;
    });

    it('throws when an error occurs', async () => {
      let existing = new WebServer(); // create an existing server
      await existing.start(); // start the pre-existing server

      // will throw EADDRINUSE due to existing server
      await expect(test.start()).to.eventually.be.rejected;

      await existing.stop(); // ensure this doesn't continue running
    });
  });

  describe('stopping', () => {
    beforeEach(async () => {
      await test.start();
    });

    it('indicates it is not running', async () => {
      expect(test.running).to.be.true;
      await test.stop();
      expect(test.running).to.be.false;
    });
  });

  describe('serving', () => {
    beforeEach(async () => {
      await test.start();
    });

    it('allows serving other routes', async () => {
      test.serve('/test', (req, res) => res.send('hello'));

      let res = await request(`${test.url}/test`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('hello');
    });

    it('allows serving other files', async () => {
      test.serve('/test', __filename);

      await expect(request(`${test.url}/test`)).to.eventually
        .have.property('statusCode', 200);
    });

    it('allows serving JSON', async () => {
      test.serve('/test', { test: true });

      let res = await request(`${test.url}/test`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('{"test":true}');
    });
  });
});

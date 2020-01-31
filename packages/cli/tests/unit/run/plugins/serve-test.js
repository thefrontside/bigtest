import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from '@tests/helpers';

import ServePlugin from '@run/plugins/serve';
import WebServer from '@run/servers/web';
import ChildProcess from '@run/process';

describe('Unit: Plugins - Serve', () => {
  let test, server;

  beforeEach(() => {
    server = new WebServer();
    server.serve('/', { testing: true });

    test = new ServePlugin({
      exec: 'echo "hello world!"',
      env: { FOO: 'BAR' },
      url: server.url,
      silent: true
    });
  });

  afterEach(async () => {
    if (server.running) {
      await server.stop();
    }
  });

  it('is initialized with provided options', () => {
    expect(test.options).to.deep.equal({
      exec: 'echo "hello world!"',
      env: { FOO: 'BAR' },
      url: server.url,
      silent: true
    });
  });

  describe('setup', () => {
    let target;

    beforeEach(() => {
      target = null;

      // stub the proxy to set a local target
      test.setup(null, {
        set: url => target = url
      });
    });

    it('set\'s the proxy target to the provided URL', () => {
      expect(target).to.equal(server.url);
    });

    it('initializes a child process with the provided command', () => {
      expect(test).to.have.property('serve')
        .that.is.an.instanceof(ChildProcess);

      expect(test.serve.command).to.equal('echo');
      expect(test.serve.arguments).to.deep.equal(['hello world!']);
    });

    it('initializes a child process with provided env vars plus defaults', () => {
      expect(test.serve.env).to.deep.equal({
        FORCE_COLOR: true,
        NODE_ENV: 'test',
        FOO: 'BAR'
      });
    });
  });

  describe('start', () => {
    beforeEach(() => {
      // command with no output so not to pollute process streams
      test.options.exec = 'sleep 0';
      test.options.silent = false;
      // stub proxy with noop target setter
      test.setup(null, { set() {} });
    });

    it('waits until the provided URL responds to requests', async () => {
      let promise = test.start();

      await server.start();
      await expect(promise).to.be.fulfilled;
    });

    it('pipes process streams while starting', async () => {
      let promise = test.start();
      expect(test.serve.piped.has(process)).to.be.true;
      await server.start();
      await promise;
    });

    it('unpipes process streams after starting', async () => {
      await server.start();
      await test.start();
      expect(test.serve.piped.has(process)).to.be.false;
    });

    it('throws after a timeout when the URL does not respond', async () => {
      test.options.timeout = 50;

      await expect(test.start())
        .to.be.rejectedWith('Unable to serve "http://localhost:3000"');
    });

    it('throws after aborting with stop', async () => {
      let promise = test.start();

      await test.stop();
      await expect(promise).to.be.rejectedWith('Aborted');
    });

    it('unpipes process streams after erroring', async () => {
      let promise = test.start();

      expect(test.serve.piped.has(process)).to.be.true;
      await test.stop();
      await expect(promise).to.be.rejected;
      expect(test.serve.piped.has(process)).to.be.false;
    });
  });

  describe('stop', () => {
    beforeEach(async () => {
      test.options.exec = 'sleep 10000';
      test.setup(null, { set() {} });
      await server.start();
      await test.start();
    });

    it('kills the process when stopping', async () => {
      expect(test.serve.running).to.be.true;
      await test.stop();
      expect(test.serve.running).to.be.false;
    });
  });
});

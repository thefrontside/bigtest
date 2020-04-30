import { Local, WebDriver } from '@bigtest/webdriver';

import { main, Operation, Context, resource } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect';
import * as express from 'express';
import fetch from 'node-fetch';
import * as fixtureManifest from './fixtures/manifest.src';

import { AgentConnectionServer, AgentServer } from '../src/index';

import { Mailbox, ensure } from '@bigtest/effection';
import { throwOnErrorEvent, once } from '@effection/events';

function* staticServer(port: number) {
  let app = express().use(express.static("./test/fixtures"));
  let server = app.listen(port);

  let res = yield resource(server, function*() {
    yield throwOnErrorEvent(server);
    yield ensure(() => server.close());
    yield;
  });

  yield once(server, "listening");
  return res;
}

describe("@bigtest/agent", function() {
  this.timeout(20000);

  let World: Context;
  function spawn<T>(operation: Operation): Promise<T> {
    return World["spawn"](operation);
  }

  beforeEach(() => {
    World = main(undefined);
  });

  afterEach(() => {
    World.halt();
  });

  describe('starting a new server', () => {
    let server: AgentServer;
    let client: AgentConnectionServer;
    let delegate: Mailbox;
    let inbox: Mailbox;

    beforeEach(async () => {
      server = AgentServer.create({port: 8000}, 'dist/app');
      client = new AgentConnectionServer({
        port: 8001,
        inbox: inbox = new Mailbox(),
        delegate: delegate = new Mailbox()
      });

      await spawn(server.listen());
      await spawn(client.listen());
    });

    it('has an agent url where it will server the agent application', () => {
      expect(server.harnessScriptURL).toBeDefined();
    });

    it('can genenrate the full connect URL', () => {
      expect(server.connectURL('ws://websocket-server.com')).toContain('websocket-server');
    });

    describe('fetching the harness', () => {

      let harnessBytes: string;
      beforeEach(async () => {
        let response = await fetch(server.harnessScriptURL);
        harnessBytes = await response.text();
      });

      it('has the javascripts', () => {
        expect(harnessBytes).toContain('harness');
      });
    });


    describe('connecting a browser to the agent URL', () => {
      let browser: WebDriver;
      let message: { agentId: string };
      let agentId: string;

      beforeEach(async function() {
        await spawn(staticServer(8002));
        browser = await spawn(Local('chromedriver', { headless: true }));
        await spawn(browser.navigateTo(server.connectURL(`ws://localhost:8001`)));
        message = await spawn(delegate.receive({ status: 'connected' })) as typeof message;
        agentId = message.agentId;
      });

      it('sends a connection message with an agent id', () => {
        expect(typeof message.agentId).toEqual('string');
      });

      describe('sending a run message', () => {
        let success;
        let failure;

        beforeEach(async () => {
          let testRunId = 'test-run-1';
          let manifestUrl = 'http://localhost:8002/manifest.js';
          let appUrl = 'http://localhost:8002/app.html';
          inbox.send({ type: 'run', testRunId, agentId, manifestUrl, appUrl, tree: fixtureManifest });

          await spawn(delegate.receive({ type: 'run:end', agentId, testRunId }));

          // we're receiving many more of these, but just checking some of them
          success = await spawn(delegate.receive({
            agentId,
            testRunId,
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'successful assertion'],
          }));

          failure = await spawn(delegate.receive({
            agentId,
            testRunId,
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'failing assertion'],
          }));
        });

        it('reports success and failure results', () => {
          expect(success.status).toEqual('ok');
          expect(failure.status).toEqual('failed');
          expect(failure.error.message).toEqual('boom');
        });
      });

      describe('closing browser connection', () => {
        let message;
        beforeEach(async () => {
          await spawn(browser.navigateTo('about:blank'));
          message = await spawn(delegate.receive({ status: 'disconnected', agentId }))
        });

        it('sends a disconnect message', () => {
          expect(message).toBeDefined();
        });
      });
    });
  });

  describe('a proxy development server', () => {
    let server: AgentServer;
    beforeEach(async () => {
      server = AgentServer.create({ port: 8000, externalURL: 'http://host.com' });
    });

    it('appends the pre-configured connect back url', () => {
      expect(server.connectURL('ws://localhost:5000')).toEqual(`http://host.com/?connectTo=${encodeURIComponent('ws://localhost:5000')}`);
    });
  });
});

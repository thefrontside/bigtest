import { main, Operation, Context } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect';
import * as express from 'express';
import fetch from 'node-fetch';
import * as fixtureManifest from './fixtures/manifest.src';

import { firefox, BrowserType, Browser, Page } from 'playwright';

import { AgentConnectionServer, AgentServer } from '../src/index';

import { Mailbox, monitorErrors, suspend, ensure, once } from '@bigtest/effection';


function* staticServer(port: number) {
  let app = express().use(express.static("./test/fixtures"));
  let server = app.listen(port);

  yield suspend(monitorErrors(server));
  yield suspend(ensure(() => server.close()));

  yield once(server, "listening");
}

describe("@bigtest/agent", function() {
  this.timeout(20000);

  let World: Context;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World["spawn"](operation);
  }

  function launch(browserType: BrowserType, options = {}): Promise<Browser> {
    return spawn(({ resume, fail, context: { parent } }) => {
      browserType.launch(options)
        .then(browser => {
          parent['ensure'](() => browser.close());
          resume(browser);
        })
        .catch(error => fail(error));
    });
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
      let browser: Browser;
      let page: Page;
      let message: { agentId: string };
      let agentId: string;

      beforeEach(async function() {
        await spawn(staticServer(8002));
        browser = await launch(firefox, { headless: true });
        page = await browser.newPage();
        await page.goto(server.connectURL(`ws://localhost:8001`));
        message = await spawn(delegate.receive({ status: 'connected' })) as typeof message;
        agentId = message.agentId;
      });

      afterEach(async () => {
        if (page) {
          await page.close();
        }
      })

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

          await spawn(delegate.receive({ type: 'testRun:done', agentId, testRunId }));

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
          expect(failure.status).toEqual('failure');
          expect(failure.error.message).toEqual('boom');
        });
      });

      describe('closing browser connection', () => {
        let message;
        beforeEach(async () => {
          await page.close();
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

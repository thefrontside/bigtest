import { Local, WebDriver } from '@bigtest/webdriver';
import { ParcelProcess } from '@bigtest/parcel';
import { readyResource } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';

import { describe, it } from 'mocha';
import * as expect from 'expect';
import fetch from 'node-fetch';
import * as fixtureManifest from './fixtures/manifest.src';

import { AgentConnectionServer, AgentServerConfig, AssertionResult, StepResult } from '../src/index';

import { Mailbox } from '@bigtest/effection';

import { main } from './helpers';

function* staticServer(port: number) {
  let app = express();
  return yield readyResource(app, function*(ready) {
    app.use(staticMiddleware("./test/fixtures"));
    yield app.listen(port);
    ready();
    yield;
  });
}

let config = new AgentServerConfig({ port: 8000 });

describe("@bigtest/agent", function() {
  this.timeout(process.env.CI ? 60000 : 10000);

  describe('config', () => {
    it('has an agent url where it will server the agent application', () => {
      expect(config.harnessUrl()).toBeDefined();
    });

    it('can genenrate the full connect URL', () => {
      expect(config.agentUrl('ws://websocket-server.com')).toContain('websocket-server');
    });
  });

  describe('starting a new server', () => {
    let client: AgentConnectionServer;
    let delegate: Mailbox;
    let inbox: Mailbox;

    beforeEach(async () => {
      await main(ParcelProcess.create(['./app/index.html', './app/harness.ts'], { port: 8000 }))

      client = new AgentConnectionServer({
        port: 8001,
        inbox: inbox = new Mailbox(),
        delegate: delegate = new Mailbox()
      });

      await main(client.listen());
    });

    describe('fetching the harness', () => {
      let harnessBytes: string;
      beforeEach(async () => {
        let response = await fetch(config.harnessUrl());
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
        await main(staticServer(8002));
        browser = await main(Local({ browserName: 'chrome', headless: true }));
        await main(browser.navigateTo(config.agentUrl(`ws://localhost:8001`)));
        message = await main(delegate.receive({ status: 'connected' })) as typeof message;
        agentId = message.agentId;
      });

      it('sends a connection message with an agent id', () => {
        expect(typeof message.agentId).toEqual('string');
      });

      describe('sending a run message', () => {
        let success: AssertionResult;
        let failure: AssertionResult;
        let checkContext: AssertionResult;
        let testRunId = 'test-run-1';

        beforeEach(async () => {
          let manifestUrl = 'http://localhost:8002/manifest.js';
          let appUrl = 'http://localhost:8002/app.html';
          inbox.send({ type: 'run', testRunId, agentId, manifestUrl, appUrl, tree: fixtureManifest });

          await main(delegate.receive({ type: 'run:end', agentId, testRunId }));

          // we're receiving many more of these, but just checking some of them
          success = await main(delegate.receive({
            agentId,
            testRunId,
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'successful assertion'],
          }));

          failure = await main(delegate.receive({
            agentId,
            testRunId,
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'failing assertion'],
          }));

          checkContext = await main(delegate.receive({
            agentId,
            testRunId,
            type: 'assertion:result',
            path: ['tests', 'tests that track context', 'contains entire context from all steps']
          }));
        });

        it('reports success and failure results', () => {
          expect(success.status).toEqual('ok');
          expect(failure.status).toEqual('failed');
          expect(failure.error && failure.error.message).toEqual('boom!');
        });

        it('preserves test context all the way down the entire test run', () => {
          if (checkContext.status !== "ok") {
            if (checkContext.error) {
              throw new Error(checkContext.error.message);
            } else {
              expect(checkContext.error).toBeDefined();
            }
          }
        });

        describe('steps that timeout', () => {
          let longStep: StepResult;
          beforeEach(async () => {
            longStep = await main(delegate.receive({
              agentId,
              testRunId,
              type: 'step:result',
              path: ['tests', 'test step timeouts', 'this takes literally forever']
            }));
          });

          it('cuts off steps that dont return within the given time period', () => {
            expect(longStep.status).toEqual('failed');
            expect(longStep.timeout).toEqual(true);
          });
        });

      });

      describe('closing browser connection', () => {
        let message: string;
        beforeEach(async () => {
          await main(browser.navigateTo('about:blank'));
          message = await main(delegate.receive({ status: 'disconnected', agentId }))
        });

        it('sends a disconnect message', () => {
          expect(message).toBeDefined();
        });
      });
    });
  });
});

import { Local, WebDriver } from '@bigtest/webdriver';

import { resource } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect';
import * as express from 'express';
import fetch from 'node-fetch';
import * as fixtureManifest from './fixtures/manifest.src';

import { AgentConnectionServer, AgentServer, AssertionResult, StepResult } from '../src/index';

import { Mailbox, ensure } from '@bigtest/effection';
import { throwOnErrorEvent, once } from '@effection/events';

import { spawn } from './helpers';

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
  this.timeout(process.env.CI ? 60000 : 10000);

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
        browser = await spawn(Local({ browserName: 'chrome', headless: true }));
        await spawn(browser.navigateTo(server.connectURL(`ws://localhost:8001`)));
        message = await spawn(delegate.receive({ status: 'connected' })) as typeof message;
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

          checkContext = await spawn(delegate.receive({
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
            longStep = await spawn(delegate.receive({
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

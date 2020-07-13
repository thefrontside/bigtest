import { Local, WebDriver } from '@bigtest/webdriver';
import { readyResource } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';

import { ChainableSubscription, subscribe } from '@effection/subscription';
import { static as staticMiddleware } from 'express';

import { describe, it, beforeEach } from 'mocha';
import expect from 'expect';
import fetch from 'node-fetch';
import fixtureManifest from './fixtures/manifest';

import { AgentServerConfig, AgentEvent, createAgentHandler, AgentConnection, AssertionResult } from '../src/index';

import { run } from './helpers';
import { StepResult } from '@bigtest/suite';

function* staticServer(port: number) {
  let app = express();
  return yield readyResource(app, function*(ready) {
    app.raw.use(staticMiddleware("./tmp/test"));
    yield app.listen(port);
    ready();
    yield;
  });
}

let config = new AgentServerConfig({ port: 8000 });

describe("@bigtest/agent", function() {
  beforeEach(() => {
    expect(fixtureManifest).toBeDefined();
  });

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
    let connections: ChainableSubscription<AgentConnection, undefined>;

    beforeEach(async () => {
      await run(staticServer(8000));

      connections = await run(createAgentHandler(8001));

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
      let connection: AgentConnection;
      let events: ChainableSubscription<AgentEvent, undefined>;

      beforeEach(async function() {
        browser = await run(Local({ browserName: 'chrome', headless: true }));
        await run(browser.navigateTo(config.agentUrl(`ws://localhost:8001`)));
        connection = await run(connections.expect());
        events = await run(subscribe(connection.events));

      });

      it('sends a connection message with an agent id', () => {
        expect(typeof connection.agentId).toEqual('string');
      });

      describe('sending a run message', () => {
        let testRunId = 'test-run-1';

        beforeEach(async () => {
          let manifestUrl = 'http://localhost:8000/manifest.js';
          let appUrl = 'http://localhost:8000/';
          let stepTimeout = 500;

          connection.send({ type: 'run', testRunId, manifestUrl, appUrl, tree: fixtureManifest, stepTimeout });
        });

        it('receives success results', async () => {
          expect(await run(events.match({
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'successful assertion']
          }).first())).toBeDefined()
        });

        it('receives failure results', async () => {
          let result = await run(events.match({
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'failing assertion']
          }).first()) as AssertionResult;

          expect(result.status).toEqual('failed');
          let error = result.error;
          let stack = error && error.stack;
          let consoleMessages = result.console;
          if(error && stack && consoleMessages) {
            expect(error.name).toEqual('Error');
            expect(error.message).toEqual('boom!');
            expect(stack[0].source && stack[0].source.fileName).toContain('/test/fixtures/manifest.js');
            expect(consoleMessages).toEqual(expect.arrayContaining([
              { level: 'log', text: 'this is a good step' },
              { level: 'log', text: 'some log message here' },
              { level: 'log', text: 'another log message' },
              { level: 'error', text: 'I am going to fail' },
            ]));
          } else {
            throw new Error("error and stack must be defined");
          }
        });

        it('receives the run:end event', async () => {
          expect(await run(events.match({ type: 'run:end', testRunId }).first())).toBeDefined();
        });

        it('preserves test context all the way down the entire test run', async () => {
          let checkContext = await run(events.match({
            type: 'assertion:result',
            path: ['tests', 'tests that track context', 'contains entire context from all steps']
          }).first());

          expect(checkContext).toMatchObject({ status: 'ok' });
        });

        describe('steps that timeout', () => {
          let longStep: StepResult;
          beforeEach(async () => {
            longStep = await run(events.match({
              type: 'step:result',
              path: ['tests', 'test step timeouts', 'this takes literally forever']
            }).first()) as unknown as StepResult;
          });

          it('cuts off steps that dont return within the given time period', () => {
            expect(longStep).toMatchObject({
              status: 'failed',
              timeout: true
            });
          });
        });

        describe('steps that mock fetch', () => {
          let step: StepResult;
          beforeEach(async () => {
            step = await run(events.match({
              type: 'step:result',
              path: ['tests', 'test fetch', 'fetch is mocked']
            }).first()) as unknown as StepResult;
          });

          it('succeeds', async () => {
            expect(step.status).toEqual('ok');
          });
        });
      });

      describe('closing browser connection', () => {
        let closed: boolean;
        beforeEach(async () => {
          closed = false;
          await run(browser.navigateTo('about:blank'));
          await run(events.forEach(function*() { yield Promise.resolve()}));
          closed = true;
        });

        it('sends a disconnect message', () => {
          expect(closed).toEqual(true);
        });
      });
    });
  });
});

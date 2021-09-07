import { describe, it, beforeEach } from '@effection/mocha';

import { createWebDriver, WebDriver } from '@bigtest/webdriver';
import { express, Express } from '@bigtest/effection-express';

import { Resource, Stream, createChannel, createQueue, Queue, spawn } from 'effection';
import { static as staticMiddleware } from 'express';

import expect from 'expect';
import fetch from 'node-fetch';
import fixtureManifest from './fixtures/manifest';

import { AgentServerConfig, AgentEvent, createAgentHandler, AgentConnection, AssertionResult, RunEnd } from '../src/index';

import { StepResult } from '@bigtest/suite';

function staticServer(): Resource<Express> {
  return {
    *init() {
      let app = yield express();
      app.raw.use(staticMiddleware("./tmp/test"));
      yield app.listen(8000);
      return app;
    }
  }
}

let config = new AgentServerConfig({ port: 8000 });

describe("@bigtest/agent", function() {
  beforeEach(function*() {
    expect(fixtureManifest).toBeDefined();
  });

  if (process.platform === 'win32') {
    this.timeout(process.env.CI ? 120000 : 30000);
  } else {
    this.timeout(process.env.CI ? 60000 : 10000);
  }

  describe('config', () => {
    it('has an agent url where it will server the agent application', function*() {
      expect(config.harnessUrl()).toBeDefined();
    });

    it('can genenrate the full connect URL', function*() {
      expect(config.agentUrl('ws://websocket-server.com')).toContain('websocket-server');
    });
  });

  describe('starting a new server', () => {
    let connections: Queue<AgentConnection>;

    beforeEach(function*() {
      connections = createQueue();
      yield staticServer();

      let handler = yield express();
      handler.ws('*', createAgentHandler((connection) => function*() {
        connections.send(connection);
        yield;
      }));
      yield handler.listen(8001);
    });

    describe('fetching the harness', () => {
      let harnessBytes: string;
      beforeEach(function*() {
        let response = yield fetch(config.harnessUrl());
        harnessBytes = yield response.text();
      });

      it('has the javascripts', function*() {
        expect(harnessBytes).toContain('harness');
      });
    });

    describe('connecting a browser to the agent URL', () => {
      let browser: WebDriver;
      let connection: AgentConnection;

      beforeEach(function*() {
        browser = yield createWebDriver({ type: 'local', headless: process.env.CI ? true : false });
        yield browser.connect(config.agentUrl(`ws://localhost:8001`));
        connection = yield connections.expect();
      });

      it('sends a connection message with an agent id', function*() {
        expect(typeof connection.agentId).toEqual('string');
      });

      describe('sending a run message', () => {
        let testRunId = 'test-run-1';
        let events: Stream<AgentEvent>;

        beforeEach(function*() {
          let channel = createChannel<AgentEvent>();
          yield spawn(connection.forEach(channel.send));
          events = yield channel.buffered();

          let manifestUrl = 'http://localhost:8000/global-manifest.js';
          let appUrl = 'http://localhost:8000/app';
          let stepTimeout = 500;

          yield connection.send({ type: 'run', testRunId, manifestUrl, appUrl, tree: fixtureManifest, stepTimeout });
        });

        it('receives success results', function*() {
          expect(yield events.match({
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'successful assertion']
          }).first()).toBeDefined()
        });

        it('receives failure results', function*() {
          let result: AssertionResult = yield events.match({
            type: 'assertion:result',
            path: ['tests', 'test with failing assertion', 'failing assertion']
          }).first();

          expect(result.status).toEqual('failed');
          let error = result.error;
          let stack = error && error.stack;
          let logEvents = result.logEvents;
          if(error && stack && logEvents) {
            expect(error.name).toEqual('Error');
            expect(error.message).toEqual('boom!');
            expect(stack[0].source && stack[0].source.fileName).toContain('fixtures/manifest.js');
            expect(logEvents).toEqual(expect.arrayContaining([
              expect.objectContaining({ type: "message", message: { level: 'log', text: 'this is a good step' } }),
              expect.objectContaining({ type: "message", message: { level: 'log', text: 'some log message here' } }),
              expect.objectContaining({ type: "message", message: { level: 'log', text: 'another log message' } }),
              expect.objectContaining({ type: "message", message: { level: 'error', text: 'I am going to fail' } }),
              expect.objectContaining({ type: "error", error: expect.objectContaining({ message: 'uncaught error from test' }) }),
              expect.objectContaining({ type: "error", error: expect.objectContaining({ message: 'uncaught error from app' }) }),
            ]));
          } else {
            throw new Error("error and stack must be defined");
          }
        });

        it('receives the run:end event', function*() {
          expect(yield events.match({ type: 'run:end', testRunId }).first()).toBeDefined();
        });

        it('preserves test context all the way down the entire test run', function*() {
          let checkContext = yield events.match({
            type: 'assertion:result',
            path: ['tests', 'tests that track context', 'contains entire context from all steps']
          }).first();

          expect(checkContext).toMatchObject({ status: 'ok' });
        });

        it('preserves test context all the way down the entire test run without async', function*() {
          let checkContext = yield events.match({
            type: 'assertion:result',
            path: ['tests', 'tests that track context without async', 'contains entire context from all steps']
          }).first();

          expect(checkContext).toMatchObject({ status: 'ok' });
        });

        describe('steps that timeout', () => {
          let longStep: StepResult;
          beforeEach(function*() {
            longStep = yield events.match({
              type: 'step:result',
              path: ['tests', 'test step timeouts', '0:this takes literally forever']
            }).first();
          });

          it('cuts off steps that dont return within the given time period', function*() {
            expect(longStep).toMatchObject({
              status: 'failed',
              timeout: true
            });
          });
        });

        describe('steps that mock fetch', () => {
          let step: StepResult;
          beforeEach(function*() {
            step = yield events.match({
              type: 'step:result',
              path: ['tests', 'test fetch', '0:fetch is mocked']
            }).first();
          });

          it('succeeds', function*() {
            expect(step.status).toEqual('ok');
          });
        });

        describe('persistent storage', () => {
          describe('local and session storage', () => {
            let one: AssertionResult;
            let two: AssertionResult;

            beforeEach(function*() {
              one = yield events.match({
                type: 'assertion:result',
                path: ['tests', 'local storage and session storage 1']
              }).first();
              two = yield events.match({
                type: 'assertion:result',
                path: ['tests', 'local storage and session storage 2']
              }).first();
            });

            it('is clean before every sequence of steps', function*() {
              expect(one.status).toEqual('ok');
              expect(two.status).toEqual('ok');
            });
          });
          describe('indexedDB', () => {
            let one: AssertionResult;
            let two: AssertionResult;

            beforeEach(function*() {
              one = yield events.match({
                type: 'assertion:result',
                path: ['tests', 'indexedDB 1']
              }).first();
              two = yield events.match({
                type: 'assertion:result',
                path: ['tests', 'indexedDB 2']
              }).first();
            });

            it('is clean before every sequence of steps', function*() {
              expect(one.status).toEqual('ok');
              expect(two.status).toEqual('ok');
            });
          });
        });

        describe('coverage', () => {
          let end: RunEnd;
          beforeEach(function*() {
            end = yield events.match({
              type: 'run:end'
            }).expect();
          });

          it('is reported with the run:end event', function*() {
            expect(end).toMatchObject({
              type: 'run:end',
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              coverage: require('./fixtures/coverage-data').coverageData
            })
          });
        });

      });

      describe('closing browser connection', () => {
        it('closes connection', function*() {
          yield browser.connect('about:blank');
          yield connection.join();
        });
      });
    });
  });
});

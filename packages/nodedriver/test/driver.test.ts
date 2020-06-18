import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Mailbox } from '@bigtest/effection';
import { AgentConnectionServer, AssertionResult, StepResult } from '@bigtest/agent';
import { Driver } from '@bigtest/driver';
import { run } from './helpers';

import { create, NodeOptions } from '../src/index';

import { fixtureManifest, serveFixtureManifest } from './fixtures';

describe('@bigtest/nodedriver', () => {
  let server: AgentConnectionServer;
  let inbox: Mailbox;
  let delegate: Mailbox;
  let connect: { agentId: string }
  let driver: Driver<NodeOptions>;
  let agentId: string;

  beforeEach(async () => {
    server = new AgentConnectionServer({
      port: 8001,
      inbox: inbox = new Mailbox(),
      delegate: delegate = new Mailbox()
    });

    await run(server.listen());

    driver = await(run(create({
      module: "@bigtest/nodedriver",
      options: {}
    })));

    await(run(driver.connect('http://ignore.com?connectTo=ws://localhost:8001&agentId=nodeAgent')));

    connect = await run(delegate.receive({ status: 'connected'}));
    agentId = connect.agentId;

    await run(serveFixtureManifest(8002));
  });

  it('connects to an orchestrator', () => {
    expect(connect.agentId).toEqual('nodeAgent');
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

      await run(delegate.receive({ type: 'run:end', agentId, testRunId }));


      // we're receiving many more of these, but just checking some of them
      success = await run(delegate.receive({
        agentId,
        testRunId,
        type: 'assertion:result',
        path: ['tests', 'test with failing assertion', 'successful assertion'],
      }));

      failure = await run(delegate.receive({
        agentId,
        testRunId,
        type: 'assertion:result',
        path: ['tests', 'test with failing assertion', 'failing assertion'],
      }));

      checkContext = await run(delegate.receive({
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

    it.skip('preserves test context all the way down the entire test run', () => {
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
        longStep = await run(delegate.receive({
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

  })
});

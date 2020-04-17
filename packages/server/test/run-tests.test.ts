import * as expect from 'expect';
import { Mailbox } from '@bigtest/effection';
import { Agent, Command } from '@bigtest/agent';
import { TestResult } from '@bigtest/suite';
import { actions } from './helpers';
import { Client } from '../src/client';

describe('running tests on an agent', () => {
  let client: Client;
  let agent: Agent;

  beforeEach(async () => {
    await actions.startOrchestrator();
    agent = await actions.createAgent();
    client = await actions.fork(Client.create(`http://localhost:24102`));

    agent.send({
      type: 'connected',
      data: {
        platform: {
          type: 'tests',
          vendor: 'Frontside'
        }
      }
    });

    let agents = await actions.fork(client.subscribe(`{ agents { agentId } }`));
    await actions.fork(agents.receive(({ agents }) => agents && agents.length > 0));
  });

  describe('with the fixture tree', () => {
    let subscription: Mailbox;
    let runCommand: Command;

    beforeEach(async () => {
      await actions.fork(client.query(`mutation { run }`));

      runCommand = await actions.fork(agent.receive());
      subscription = await actions.fork(client.subscribe(`
fragment results on TestResult {
  description
  status
  steps {
    description
    status
  }
  assertions {
    description
    status
  }
}

{
  testRun(id: "${runCommand.testRunId}") {
    testRunId
    status
    tree {
      ...results
      children {
        ...results
        children {
          ...results
        }
      }
    }
  }
}
`));
    });

    it('receives a run event on the agent', () => {
      expect(runCommand.type).toEqual('run');
      expect(runCommand.appUrl).toEqual(`http://localhost:24101`);
      expect(runCommand.tree.description).toEqual('All tests');
    });

    describe('when the agent reports that it is running', () => {
      beforeEach(() => {
        agent.send({
          type: 'run:begin',
          testRunId: runCommand.testRunId
        });
      });

      it('is marks the run as running', async () => {
        await actions.fork(subscription.receive({ testRun: { status: 'running' }}));
      });
    });

    describe('when a test is reported as running', () => {
      beforeEach(() => {
        agent.send({
          type: 'test:running',
          testRunId: runCommand.testRunId,
          path: ['All tests']
        });
      });

      it('marks that particular test as running', async () => {
        await actions.fork(subscription.receive({ testRun: { tree: { status: 'running' } } }));
      });
    });

    describe('when a step fails', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', "Signing In", "when I fill in the login form"],
          error: {
            message: "this step failed",
            fileName: 'here.js',
            lineNumber: 5,
            columnNumber: 10,
            stack: ['here.js', 'there.js']
          }
        })
      });

      it('marks that step as failed', async () => {
        await actions.fork(subscription.receive(({ testRun }) => {
          return testRun.tree.children
            .find(child => child.description === "Signing In" ).steps
            .find(child => child.description === "when I fill in the login form").status === 'failed';
        }));
      });

      it('disregards the remaining steps, and remaining children', async() => {
        await actions.fork(subscription.receive(({ testRun }) => {
          let tree = testRun.tree.children
            .find(child => child.description === "Signing In" )

          let { assertions, children } = tree;

          return assertions.every(assertion => assertion.status === 'disregarded')
            && children.every(child => child.status === 'disregarded');

        }));
      });
    });
  });
});

interface TestRun {
  testRunId: string;
  status: 'pending' | 'running' | 'done';
  tree: TestResult;
}

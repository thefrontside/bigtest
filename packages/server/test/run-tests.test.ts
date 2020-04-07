import * as expect from 'expect';
import { Agent, Command } from '@bigtest/agent';
import { TestResult } from '@bigtest/suite';
import { actions, Subscription } from './helpers';

describe('running tests on an agent', () => {
  let agent: Agent;

  beforeEach(async () => {
    await actions.startOrchestrator();
    agent = await actions.createAgent();

    agent.send({
      type: 'connected',
      data: {
        platform: {
          type: 'tests',
          vendor: 'Frontside'
        }
      }
    });

    await actions.query(`{ agents { agentId } }`, ({ agents }: any) => agents.length > 0);
  });

  describe('with the fixture tree', () => {
    let subscription: Subscription<TestRun>;
    let runCommand: Command;
    beforeEach(async () => {
      await actions.query(`mutation { run }`);
    });

    beforeEach(async () => {
      runCommand = await actions.fork(agent.receive());
    });

    beforeEach(async () => {
      subscription = await actions.subscribe(`
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
  testRuns {
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
`, data => (data as any).testRuns.find((r: TestRun) => r.testRunId === runCommand.testRunId));
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
        await actions.fork(subscription.until(run => run.status === 'running'));
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
        await actions.fork(subscription.until(run => run.tree.status === 'running'));
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
        await actions.fork(subscription.until(run => {
          return run.tree.children
            .find(child => child.description === "Signing In" ).steps
            .find(child => child.description === "when I fill in the login form").status === 'failed';
        }))
      });

      it('disregards the remaining steps, and remaining children', async() => {
        await actions.fork(subscription.until(run => {
          let tree = run.tree.children
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

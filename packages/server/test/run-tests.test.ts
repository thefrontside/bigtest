import * as expect from 'expect';
import { Mailbox } from '@bigtest/effection';
import { Agent, Command } from '@bigtest/agent';
import { TestResult } from '@bigtest/suite';
import { actions } from './helpers';
import { Client } from '../src/client';
import { generateAgentId } from '../src/connection-server';

function resultsQuery(testRunId, agentId) {
  return `
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
      testRun(id: "${testRunId}") {
        testRunId
        status
        agent(id: "${agentId}") {
          status
          agent {
            agentId
          }
          result {
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
    }
  `;
}

describe('running tests on an agent', () => {
  let client: Client;
  let agent: Agent;
  let agentId = generateAgentId();
  let agentsSubscription: Mailbox;

  beforeEach(async () => {
    await actions.startOrchestrator();
    agent = await actions.createAgent();
    client = await actions.fork(Client.create(`http://localhost:24102`));

    agent.send({ type: 'connected', agentId, data: {} });

    agentsSubscription = await actions.fork(client.subscribe(`{ agents { agentId } }`));
    await actions.fork(agentsSubscription.receive(({ agents }) => agents && agents.length === 1));
  });

  describe('with the fixture tree', () => {
    let results: Mailbox;
    let runCommand: Command;

    beforeEach(async () => {
      await actions.fork(client.query(`mutation { run }`));

      runCommand = await actions.fork(agent.receive());
      results = await actions.fork(client.subscribe(resultsQuery(runCommand.testRunId, agentId)));
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
        await actions.fork(results.receive({ testRun: { status: 'running' }}));
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

      it('marks that particular agent as running', async () => {
        await actions.fork(results.receive({ testRun: { agent: { status: 'running' } } }));
      });

      it('marks that particular test as running', async () => {
        await actions.fork(results.receive({ testRun: { agent: { result: { status: 'running' } } } }));
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
        await actions.fork(results.receive(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" ).steps
            .find(child => child.description === "when I fill in the login form").status === 'failed';
        }));
      });

      it('disregards the remaining steps, and remaining children', async() => {
        await actions.fork(results.receive(({ testRun }) => {
          let results = testRun.agent.result.children
            .find(child => child.description === "Signing In" )

          let { assertions, children } = results;

          return assertions.every(assertion => assertion.status === 'disregarded')
            && children.every(child => child.status === 'disregarded');

        }));
      });
    });
  });

  describe('with multiple agents', function() {
    let secondAgentId = generateAgentId();
    let secondAgent: Agent;
    let agentResults: Mailbox;
    let secondAgentResults: Mailbox;

    beforeEach(async () => {
      secondAgent = await actions.createAgent();

      secondAgent.send({ type: 'connected', agentId: secondAgentId, data: {} });

      await actions.fork(agentsSubscription.receive(({ agents }) => agents && agents.length === 2));

      await actions.fork(client.query(`mutation { run }`));

      let runCommand: Command = await actions.fork(agent.receive());
      agentResults = await actions.fork(client.subscribe(resultsQuery(runCommand.testRunId, agentId)));
      secondAgentResults = await actions.fork(client.subscribe(resultsQuery(runCommand.testRunId, secondAgentId)));

      secondAgent.send({
        type: 'step:result',
        status: 'ok',
        testRunId: runCommand.testRunId,
        path: ['All tests', "Signing In", "when I fill in the login form"]
      });

      agent.send({
        type: 'step:result',
        status: 'failed',
        testRunId: runCommand.testRunId,
        path: ['All tests', "Signing In", "when I fill in the login form"],
        error: { message: "this step failed", fileName: 'here.js', lineNumber: 5, columnNumber: 10, stack: ['here.js', 'there.js'] }
      });
    });

    it('tracks results for all agents separately', async () => {
      await actions.fork(agentResults.receive(({ testRun }) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" ).steps
          .find(child => child.description === "when I fill in the login form").status === 'failed';
      }));
      await actions.fork(secondAgentResults.receive(({ testRun }) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" ).steps
          .find(child => child.description === "when I fill in the login form").status === 'ok';
      }));
    });
  });
});

interface TestRun {
  testRunId: string;
  status: 'pending' | 'running' | 'done';
  tree: TestResult;
}

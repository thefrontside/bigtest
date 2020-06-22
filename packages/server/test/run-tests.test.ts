import * as expect from 'expect';
import { Mailbox } from '@bigtest/effection';
import { Agent, Command } from '@bigtest/agent';
import { ResultStatus } from '@bigtest/suite';
import { actions } from './helpers';
import { Client } from '../src/client';
import { generateAgentId } from '../src/connection-server';

interface QueryResult {
  testRun: {
    testRunId: string;
    status: ResultStatus;
    agent: {
      status: ResultStatus;
      agent: {
        agentId: string;
      };
      result: QueryTestResult;
    };
  };
}

interface QueryTestResult {
  description: string;
  status: ResultStatus;
  steps: Array<{
    description: string;
    status: ResultStatus;
  }>;
  assertions: Array<{
    description: string;
    status: ResultStatus;
  }>;
  children: [QueryTestResult];
}

interface AgentsQuery {
  agents: {
    agentId: string;
  }[];
}

function resultsQuery(testRunId: string, agentId: string) {
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
    agent = await actions.createAgent(agentId);
    client = await actions.fork(Client.create(`http://localhost:24102`));

    agentsSubscription = await actions.fork(client.liveQuery(`{ agents { agentId } }`));

    let match: (params: AgentsQuery) => boolean = ({ agents }) => agents && agents.length === 1;

    await actions.fork(agentsSubscription.receive(match));
  });

  describe('with the fixture tree', () => {
    let results: Mailbox;
    let runCommand: Command;

    beforeEach(async () => {
      await actions.fork(client.query(`mutation { run }`));

      runCommand = await actions.fork(agent.receive());
      results = await actions.fork(client.liveQuery(resultsQuery(runCommand.testRunId, agentId)));
    });

    it('receives a run event on the agent', () => {
      expect(runCommand.type).toEqual('run');
      expect(runCommand.appUrl).toEqual(`http://localhost:24101`);
      expect(runCommand.tree.description).toEqual('All tests');
    });

    it('is marks the run as pending', async () => {
      await actions.fork(results.receive({ testRun: { status: 'pending' }}));
    });

    describe('when the agent reports that it is running', () => {
      beforeEach(() => {
        agent.send({
          type: 'run:begin',
          testRunId: runCommand.testRunId
        });
      });

      it('is marks the agent as running', async () => {
        await actions.fork(results.receive({ testRun: { agent: { status: 'running' } }}));
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
        await actions.fork(results.receive({ testRun: { agent: { result: { status: 'running' } } } }));
      });
    });

    describe('when a step succeeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', "Signing In", "when I fill in the login form"]
        })
      });

      it('marks that step as ok', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.steps
            .find(child => child.description === "when I fill in the login form")?.status === 'ok';
        }));
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
          }
        })
      });

      it('marks that step as failed', async () => {
        let match: (result: QueryResult) => boolean = ({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.steps
            .find(child => child.description === "when I fill in the login form")?.status === 'failed';
        };
        await actions.fork(results.receive(match));
      });

      it('marks the entire test as failed', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.status === 'failed';
        }));
      });

      it('disregards the remaining steps, and remaining children', async() => {
        let match: (result: QueryResult) => boolean = ({ testRun }) => {
          let results = testRun.agent.result.children
            .find(child => child.description === "Signing In");

          if (results) {
            let { assertions, children } = results;

            return assertions.every(assertion => assertion.status === 'disregarded')
              && children.every(child => child.status === 'disregarded');
          } else {
            return false;
          }
        };
        await actions.fork(results.receive(match));
      });
    });

    describe('when a assertion succeeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am logged in']
        })
      });

      it('marks that assertion as ok', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In' )?.assertions
            .find(child => child.description === 'then I am logged in')?.status === 'ok';
        }));
      });
    });

    describe('when a assertion fails', () => {
      beforeEach(() => {
        agent.send({
          type: 'assertion:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am logged in'],
          error: {
            message: 'this assertion failed',
          }
        })
      });

      it('marks that assertion as failed', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.assertions
            .find(child => child.description === 'then I am logged in')?.status === 'failed';
        }));
      });
    });

    describe('when an entire test succeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'when I click on the logout button']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'it takes me back to the homepage']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'My username is no longer in the top bar']
        })
      });

      it('marks that test as ok', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.children
            .find(child => child.description === 'when I log out')?.status === 'ok'
        }));
      });
    });

    describe('when an entire test completes with mixed results', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'when I click on the logout button']
        })
        agent.send({
          type: 'assertion:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'it takes me back to the homepage']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'My username is no longer in the top bar']
        })
      });

      it('marks that test as failed', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.children
            .find(child => child.description === 'when I log out')?.status === 'failed'
        }));
      });
    });

    describe('when a test completes successfully but one of its children fails', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'given a user']
        })
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I fill in the login form']
        })
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I press the submit button']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am logged in']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am on the homepage']
        })
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'when I click on the logout button']
        })
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I go to the main navigation page', 'I click the hamburger button']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I go to the main navigation page', 'I see my username']
        })
      });

      it('marks that test as failed', async () => {
        await actions.fork(results.receive(({ testRun }: QueryResult) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.status === 'failed';
        }));
      });

      it('marks the entire agent as failed if it is the root test', async () => {
        await actions.fork(results.receive({ testRun: { agent: { status: 'failed' } } }));
      });

      it('marks the entire suite as failed if it is the root test', async () => {
        await actions.fork(results.receive({ testRun: { agent: { status: 'failed' } } }));
      });
    });
  });

  describe('with multiple agents', function() {
    let secondAgentId = generateAgentId();
    let secondAgent: Agent;
    let agentResults: Mailbox;
    let secondAgentResults: Mailbox;

    beforeEach(async () => {
      secondAgent = await actions.createAgent(secondAgentId);

      let match: (results: AgentsQuery) => boolean = ({ agents }) => agents && agents.length === 2;

      await actions.fork(agentsSubscription.receive(match));

      await actions.fork(client.query(`mutation { run }`));

      let runCommand: Command = await actions.fork(agent.receive());
      agentResults = await actions.fork(client.liveQuery(resultsQuery(runCommand.testRunId, agentId)));
      secondAgentResults = await actions.fork(client.liveQuery(resultsQuery(runCommand.testRunId, secondAgentId)));

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
        error: { message: "this step failed" }
      });
    });

    it('tracks results for all agents separately', async () => {
      let matchFailed: (result: QueryResult) => boolean = ({ testRun }) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" )?.steps
          .find(child => child.description === "when I fill in the login form")?.status === 'failed';
      };

      await actions.fork(agentResults.receive(matchFailed));

      let matchSucess: (result: QueryResult) => boolean = ({ testRun }) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" )?.steps
          .find(child => child.description === "when I fill in the login form")?.status === 'ok';
      }

      await actions.fork(secondAgentResults.receive(matchSucess));
    });
  });
});

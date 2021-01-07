import expect from 'expect';
import { Agent, Command, generateAgentId } from '@bigtest/agent';
import { Client } from '@bigtest/client';
import { ResultStatus } from '@bigtest/suite';
import { ChainableSubscription } from '@effection/subscription';
import { actions } from './helpers';

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
  let agentsSubscription: ChainableSubscription<AgentsQuery, unknown>;

  beforeEach(async () => {
    await actions.startOrchestrator();
    agent = await actions.createAgent(agentId);
    client = await actions.fork(Client.create(`http://localhost:24102`));

    agentsSubscription = await actions.fork(client.liveQuery(`{ agents { agentId } }`));

    await actions.fork(agentsSubscription.filter(({ agents }) => {
      return agents && agents.length === 1;
    }).first());
  });

  describe('with the fixture tree', () => {
    let results: ChainableSubscription<QueryResult, unknown>;
    let runCommand: Command;

    beforeEach(async () => {
      await actions.fork(client.query(`mutation { run }`));
      runCommand = await actions.fork(agent.receive());

      results = await actions.fork(client.liveQuery(resultsQuery(runCommand.testRunId, agentId)));
    });

    it('receives a run event on the agent', () => {
      expect(runCommand.type).toEqual('run');
      expect(runCommand.appUrl).toEqual(`http://localhost:24001`);
      expect(runCommand.tree.description).toEqual('All tests');
    });

    it('is marks the run as pending', async () => {
      await actions.fork(results.match({ testRun: { status: 'pending' } }).expect());
    });

    describe('when the agent reports that it is running', () => {
      beforeEach(() => {
        agent.send({
          type: 'run:begin',
          testRunId: runCommand.testRunId
        });
      });

      it('is marks the agent as running', async () => {
        await actions.fork(results.match({ testRun: { agent: { status: 'running' } } }).expect());
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
        await actions.fork(results.match({ testRun: { agent: { result: { status: 'running' } } } }).expect());
      });
    });

    describe('when a step succeeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', "Signing In", "1:when I fill in the login form"]
        });
      });

      it('marks that step as ok', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.steps
            .find(child => child.description === "when I fill in the login form")?.status === 'ok';
        }).expect());
      });
    });

    describe('when a step fails', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', "Signing In", "1:when I fill in the login form"],
          error: {
            message: "this step failed",
          }
        });
      });

      it('marks that step as failed', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.steps
            .find(child => child.description === "when I fill in the login form")?.status === 'failed';
        }).expect());
      });

      it('marks the entire test as failed', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.status === 'failed';
        }).first());
      });

      it('disregards the remaining steps, and remaining children', async() => {
        await actions.fork(results.filter(({ testRun }) => {
          let results = testRun.agent.result.children
            .find(child => child.description === "Signing In");

          if (results) {
            let { assertions, children } = results;

            return assertions.every(assertion => assertion.status === 'disregarded')
              && children.every(child => child.status === 'disregarded');
          } else {
            return false;
          }
        }).expect());
      });
    });

    describe('when a assertion succeeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am logged in']
        });
      });

      it('marks that assertion as ok', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In' )?.assertions
            .find(child => child.description === 'then I am logged in')?.status === 'ok';
        }).expect());
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
        });
      });

      it('marks that assertion as failed', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.assertions
            .find(child => child.description === 'then I am logged in')?.status === 'failed';
        }).expect());
      });
    });

    describe('when an entire test succeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', '0:when I click on the logout button']
        });
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'it takes me back to the homepage']
        });
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'My username is no longer in the top bar']
        });
      });

      it('marks that test as ok', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.children
            .find(child => child.description === 'when I log out')?.status === 'ok';
        }).expect());
      });
    });

    describe('when an entire test completes with mixed results', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', '0:when I click on the logout button']
        });
        agent.send({
          type: 'assertion:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'it takes me back to the homepage']
        });
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', 'My username is no longer in the top bar']
        });
      });

      it('marks that test as failed', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.children
            .find(child => child.description === 'when I log out')?.status === 'failed';
        }).expect());
      });
    });

    describe('when a test completes successfully but one of its children fails', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '0:given a user']
        });
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '1:when I fill in the login form']
        });
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '2:when I press the submit button']
        });
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am logged in']
        });
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am on the homepage']
        });
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', '0:when I click on the logout button']
        });
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I go to the main navigation page', '0:I click the hamburger button']
        });
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I go to the main navigation page', 'I see my username']
        });
        agent.send({
          type: 'run:end',
          testRunId: runCommand.testRunId
        });
      });

      it('marks that test as failed', async () => {
        await actions.fork(results.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.status === 'failed';
        }).expect());
      });
    });
  });

  describe('with multiple agents', function() {
    let secondAgentId = generateAgentId();
    let secondAgent: Agent;
    let agentResults: ChainableSubscription<QueryResult, unknown>;
    let secondAgentResults: ChainableSubscription<QueryResult, unknown>;

    beforeEach(async () => {
      secondAgent = await actions.createAgent(secondAgentId);

      await actions.fork(agentsSubscription.filter(({ agents }) => {
        return agents && agents.length === 2;
      }).expect());

      await actions.fork(client.query(`mutation { run }`));

      let runCommand: Command = await actions.fork(agent.receive());
      agentResults = await actions.fork(client.liveQuery(resultsQuery(runCommand.testRunId, agentId)));
      secondAgentResults = await actions.fork(client.liveQuery(resultsQuery(runCommand.testRunId, secondAgentId)));

      secondAgent.send({
        type: 'step:result',
        status: 'ok',
        testRunId: runCommand.testRunId,
        path: ['All tests', "Signing In", "1:when I fill in the login form"]
      });

      agent.send({
        type: 'step:result',
        status: 'failed',
        testRunId: runCommand.testRunId,
        path: ['All tests', "Signing In", "1:when I fill in the login form"],
        error: { message: "this step failed" }
      });
    });

    it('tracks results for all agents separately', async () => {
      let matchFailed = ({ testRun }: QueryResult) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" )?.steps
          .find(child => child.description === "when I fill in the login form")?.status === 'failed';
      };

      await actions.fork(agentResults.filter(matchFailed).expect());

      let matchSucess = ({ testRun }: QueryResult) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" )?.steps
          .find(child => child.description === "when I fill in the login form")?.status === 'ok';
      };

      await actions.fork(secondAgentResults.filter(matchSucess).first());
    });
  });
});

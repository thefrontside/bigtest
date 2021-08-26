import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import { AgentProtocol, Command, generateAgentId } from '@bigtest/agent';
import { createClient, Client } from '@bigtest/client';
import { ResultStatus } from '@bigtest/suite';
import { Stream } from 'effection';
import { startOrchestrator, createAgent } from './helpers';

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
  let agent: AgentProtocol;
  let agentId = generateAgentId();

  beforeEach(function*() {
    yield startOrchestrator();
    agent = yield createAgent({ agentId });
    client = yield createClient(`http://localhost:24102`);

    yield client.liveQuery<AgentsQuery>(`{ agents { agentId } }`).filter(({ agents }) => {
      return agents && agents.length === 1
    }).expect();
  });

  describe('with the fixture tree', () => {
    let query: Stream<QueryResult>;
    let runCommand: Command;

    beforeEach(function*() {
      yield client.query(`mutation { run }`);
      runCommand = yield agent.expect();

      query = client.liveQuery(resultsQuery(runCommand.testRunId, agentId));
    });

    it('receives a run event on the agent', function*() {
      expect(runCommand.type).toEqual('run');
      expect(runCommand.appUrl).toEqual(`http://localhost:24001`);
      expect(runCommand.tree.description).toEqual('All tests');
    });

    it('is marks the run as pending', function*() {
      yield query.match({ testRun: { status: 'pending' }}).expect();
    });

    describe('when the agent reports that it is running', () => {
      beforeEach(function*() {
        agent.send({
          type: 'run:begin',
          testRunId: runCommand.testRunId
        });
      });

      it('is marks the agent as running', function*() {
        yield query.match({ testRun: { agent: { status: 'running' } }}).expect();
      });
    });

    describe('when a test is reported as running', () => {
      beforeEach(function*() {
        agent.send({
          type: 'test:running',
          testRunId: runCommand.testRunId,
          path: ['All tests']
        });
      });

      it('marks that particular test as running', function*() {
        yield query.match({ testRun: { agent: { result: { status: 'running' } } } }).expect();
      });
    });

    describe('when a step succeeeds', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', "Signing In", "1:when I fill in the login form"]
        })
      });

      it('marks that step as ok', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.steps
            .find(child => child.description === "when I fill in the login form")?.status === 'ok';
        }).expect();
      });
    });

    describe('when a step fails', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', "Signing In", "1:when I fill in the login form"],
          error: {
            message: "this step failed",
          }
        })
      });

      it('marks that step as failed', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.steps
            .find(child => child.description === "when I fill in the login form")?.status === 'failed';
        }).expect();
      });

      it('marks the entire test as failed', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === "Signing In" )?.status === 'failed';
        }).first();
      });

      it('disregards the remaining steps, and remaining children', function*() {
        yield query.filter(({ testRun }) => {
          let results = testRun.agent.result.children
            .find(child => child.description === "Signing In");

          if (results) {
            let { assertions, children } = results;

            return assertions.every(assertion => assertion.status === 'disregarded')
              && children.every(child => child.status === 'disregarded');
          } else {
            return false;
          }
        }).expect();
      });
    });

    describe('when a assertion succeeeds', () => {
      beforeEach(function*() {
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'then I am logged in']
        })
      });

      it('marks that assertion as ok', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In' )?.assertions
            .find(child => child.description === 'then I am logged in')?.status === 'ok';
        }).expect();
      });
    });

    describe('when a assertion fails', () => {
      beforeEach(function*() {
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

      it('marks that assertion as failed', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.assertions
            .find(child => child.description === 'then I am logged in')?.status === 'failed';
        }).expect();
      });
    });

    describe('when an entire test succeeds', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', '0:when I click on the logout button']
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

      it('marks that test as ok', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.children
            .find(child => child.description === 'when I log out')?.status === 'ok'
        }).expect();
      });
    });

    describe('when an entire test completes with mixed results', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I log out', '0:when I click on the logout button']
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

      it('marks that test as failed', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.children
            .find(child => child.description === 'when I log out')?.status === 'failed'
        }).expect();
      });
    });

    describe('when a test completes successfully but one of its children fails', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '0:given a user']
        })
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '1:when I fill in the login form']
        })
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '2:when I press the submit button']
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
          path: ['All tests', 'Signing In', 'when I log out', '0:when I click on the logout button']
        })
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I go to the main navigation page', '0:I click the hamburger button']
        })
        agent.send({
          type: 'assertion:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I go to the main navigation page', 'I see my username']
        });
        agent.send({
          type: 'run:end',
          testRunId: runCommand.testRunId
        })
      });

      it('marks that test as failed', function*() {
        yield query.filter(({ testRun }) => {
          return testRun.agent.result.children
            .find(child => child.description === 'Signing In')?.status === 'failed';
        }).expect();
      });
    });
  });

  describe('with multiple agents', function() {
    let secondAgentId = generateAgentId();
    let secondAgent: AgentProtocol;
    let runCommand: Command;

    beforeEach(function*() {
      secondAgent = yield createAgent({ agentId: secondAgentId });

      yield client.liveQuery<AgentsQuery>(`{ agents { agentId } }`).filter(({ agents }) => {
        return agents && agents.length === 2
      }).expect();

      yield client.query(`mutation { run }`);

      runCommand = yield agent.expect();

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

    it('tracks results for all agents separately', function*() {
      let matchFailed = ({ testRun }: QueryResult) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" )?.steps
          .find(child => child.description === "when I fill in the login form")?.status === 'failed';
      };

      yield client.liveQuery<QueryResult>(resultsQuery(runCommand.testRunId, agentId)).filter(matchFailed).expect();

      let matchSucess = ({ testRun }: QueryResult) => {
        return testRun.agent.result.children
          .find(child => child.description === "Signing In" )?.steps
          .find(child => child.description === "when I fill in the login form")?.status === 'ok';
      }

      yield client.liveQuery<QueryResult>(resultsQuery(runCommand.testRunId, secondAgentId)).filter(matchSucess).expect();
    });
  });
});

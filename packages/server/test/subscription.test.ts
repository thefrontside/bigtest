import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import { AgentProtocol, Command, generateAgentId } from '@bigtest/agent';
import { createClient, Client } from '@bigtest/client';
import { startOrchestrator, createAgent } from './helpers';
import { Stream } from 'effection';
import { ResultStatus } from '@bigtest/suite';

interface AgentsQuery {
  agents: {
    agentId: string;
  }[];
}

interface SubscriptionEvent {
  event: {
    type: string,
    status: ResultStatus
    testRunId: string;
    path: string[];
    error?: {
      message: string,
    },
    timeout: boolean,
  };
}

function subscriptionQuery() {
  return `
    subscription {
      event: run {
        type
        status
        testRunId
        agentId
        path
        error {
          message
        }
        timeout
      }
    }
  `;
}

describe('running tests with subscription on an agent', () => {
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

  // timeout error
  describe.skip('with the fixture tree', () => {
    let query: Stream<SubscriptionEvent>;
    let runCommand: Command;
    let testRunId: string;

    beforeEach(function*() {
      query = client.subscription(subscriptionQuery());
      runCommand = yield agent.expect();
      testRunId = runCommand.testRunId;
    });

    describe('when the agent reports that it is running', () => {
      beforeEach(function*() {
        agent.send({
          type: 'run:begin',
          testRunId: runCommand.testRunId
        });
      });

      it('sends a running event', function*() {
        let event = yield query.match({ event: { type: 'testRunAgent:running' } }).expect();
        expect(event).toMatchObject({ event: { type: 'testRunAgent:running', agentId, testRunId } });
      });
    });

    describe('when a step succeeeds', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '1:when I fill in the login form']
        })
      });

      it('sends an event for that step', function*() {
        let event = yield query.match({ event: { type: 'step:result' } }).expect();
        expect(event).toMatchObject({
          event: {
            type: 'step:result',
            status: 'ok',
            path: ['All tests', 'Signing In', '1:when I fill in the login form'],
            agentId,
            testRunId
          }
        });
      });
    });

    describe('when a step fails', () => {
      beforeEach(function*() {
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '1:when I fill in the login form'],
          error: {
            message: 'this step failed',
          }
        })
      });

      it('sends an event for that step', function*() {
        yield query.match({
          event: {
            type: 'step:result',
            status: 'failed',
            path: ['All tests', 'Signing In', '1:when I fill in the login form'],
            error: {
              message: 'this step failed',
            }
          }
        }).first();
      });

      it('sends a failed event for the entire test', function*() {
        yield query.match({
          event: {
            type: 'test:result',
            status: 'failed',
            path: ['All tests', 'Signing In'],
          }
        }).first();
      });

      it('sends a disregarded event for the remaining steps', function*() {
        yield query.match({
          event: {
            type: 'step:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', '2:when I press the submit button'],
          }
        }).first();
      });

      it('sends a disregarded event for the remaining assertions', function*() {
        yield query.match({
          event: {
            type: 'assertion:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'then I am logged in'],
          }
        }).first();
      });

      it('sends a disregarded event for the remaining children', function*() {
        yield query.match({
          event: {
            type: 'test:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'when I log out'],
          }
        }).first();
      })

    });
  });
});

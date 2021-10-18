import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import { AgentProtocol, Command, generateAgentId } from '@bigtest/agent';
import { createClient, Client } from '@bigtest/client';
import { startOrchestrator, createAgent } from './helpers';
import { Subscription, Stream, createChannel, spawn } from 'effection';

import { TestEvent } from '../src/schema/test-event';

interface AgentsQuery {
  agents: {
    agentId: string;
  }[];
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

  describe('with the fixture tree', () => {
    let query: Subscription<{ event: TestEvent }>;
    let results: Stream<{ event: TestEvent }>;
    let runCommand: Command;
    let testRunId: string;

    beforeEach(function*() {
      let { send, stream } = createChannel();
      query = yield client.subscription(subscriptionQuery());
      results = yield stream.buffered();
      yield spawn(query.forEach(send));
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
        let event = yield results.match({ event: { type: 'agent', status: 'running' } }).expect();
        expect(event).toMatchObject({ event: { agentId, testRunId } });
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
        let event = yield results.match({ event: { type: 'step' } }).expect();
        expect(event).toMatchObject({
          event: {
            type: 'step',
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
        yield results.match({
          event: {
            type: 'step',
            status: 'failed',
            path: ['All tests', 'Signing In', '1:when I fill in the login form'],
            error: {
              message: 'this step failed',
            }
          }
        }).first();
      });

      it('sends a failed event for the entire test', function*() {
        yield results.match({
          event: {
            type: 'test',
            status: 'failed',
            path: ['All tests', 'Signing In'],
          }
        }).first();
      });

      it('sends a disregarded event for the remaining steps', function*() {
        yield results.match({
          event: {
            type: 'step',
            status: 'disregarded',
            path: ['All tests', 'Signing In', '2:when I press the submit button'],
          }
        }).first();
      });

      it('sends a disregarded event for the remaining assertions', function*() {
        yield results.match({
          event: {
            type: 'assertion',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'then I am logged in'],
          }
        }).first();
      });

      it('sends a disregarded event for the remaining children', function*() {
        yield results.match({
          event: {
            type: 'test',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'when I log out'],
          }
        }).first();
      })

    });
  });
});

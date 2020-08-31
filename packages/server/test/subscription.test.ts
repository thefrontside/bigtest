import * as expect from 'expect';
import { Mailbox } from '@bigtest/effection';
import { Agent, Command } from '@bigtest/agent';
import { Client } from '@bigtest/client';
import { actions } from './helpers';
import { generateAgentId } from '../src/connection-server';

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
    let testRunId: string;

    beforeEach(async () => {
      results = await actions.fork(client.subscription(subscriptionQuery()));
      // match is returning Chain<Run, void> which seems wrong and required an explicit cast
      runCommand = await actions.fork(agent.commands.match({ type: 'run' }).first()) as Command;
      testRunId = runCommand.testRunId;
    });

    describe('when the agent reports that it is running', () => {
      beforeEach(() => {
        agent.send({
          type: 'run:begin',
          testRunId: runCommand.testRunId
        });
      });

      it('sends a running event', async () => {
        let event = await actions.fork(results.receive());
        expect(event).toMatchObject({ event: { type: 'testRunAgent:running', agentId, testRunId } });
      });
    });

    describe('when a step succeeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I fill in the login form']
        })
      });

      it('sends an event for that step', async () => {
        let event = await actions.fork(results.receive());
        expect(event).toMatchObject({
          event: {
            type: 'step:result',
            status: 'ok',
            path: ['All tests', 'Signing In', 'when I fill in the login form'],
            agentId,
            testRunId
          }
        });
      });
    });

    describe('when a step fails', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'failed',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', 'when I fill in the login form'],
          error: {
            message: 'this step failed',
          }
        })
      });

      it('sends an event for that step', async () => {
        await actions.fork(results.receive({
          event: {
            type: 'step:result',
            status: 'failed',
            path: ['All tests', 'Signing In', 'when I fill in the login form'],
            error: {
              message: 'this step failed',
            }
          }
        }));
      });

      it('sends a failed event for the entire test', async () => {
        await actions.fork(results.receive({
          event: {
            type: 'test:result',
            status: 'failed',
            path: ['All tests', 'Signing In'],
          }
        }));
      });

      it('sends a disregarded event for the remaining steps, assertions and children', async() => {
        await actions.fork(results.receive({
          event: {
            type: 'step:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'when I press the submit button'],
          }
        }));
        await actions.fork(results.receive({
          event: {
            type: 'assertion:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'then I am logged in'],
          }
        }));
        await actions.fork(results.receive({
          event: {
            type: 'test:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'when I log out'],
          }
        }));
      });
    });
  });
});

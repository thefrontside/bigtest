import * as expect from 'expect';
import { Agent, Command, generateAgentId } from '@bigtest/agent';
import { Client } from '@bigtest/client';
import { ChainableSubscription } from '@effection/subscription';
import { actions } from './helpers';

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
  let agentsSubscription: ChainableSubscription<AgentsQuery, unknown>;;

  beforeEach(async () => {
    await actions.startOrchestrator();
    agent = await actions.createAgent(agentId);
    client = await actions.fork(Client.create(`http://localhost:24102`));

    agentsSubscription = await actions.fork(client.liveQuery<AgentsQuery>(`{ agents { agentId } }`));

    await actions.fork(agentsSubscription.filter(({ agents }) => {
      return agents && agents.length === 1;
    }).first());
  });

  describe('with the fixture tree', () => {
    let results: ChainableSubscription<unknown, unknown>;
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
        let event = await actions.fork(results.match({ event: { type: 'testRunAgent:running' } }).expect());
        expect(event).toMatchObject({ event: { type: 'testRunAgent:running', agentId, testRunId } });
      });
    });

    describe('when a step succeeeds', () => {
      beforeEach(() => {
        agent.send({
          type: 'step:result',
          status: 'ok',
          testRunId: runCommand.testRunId,
          path: ['All tests', 'Signing In', '1:when I fill in the login form']
        })
      });

      it('sends an event for that step', async () => {
        let event = await actions.fork(results.match({ event: { type: 'step:result' } }).expect());
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
      beforeEach(() => {
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

      it('sends an event for that step', async () => {
        await actions.fork(results.match({
          event: {
            type: 'step:result',
            status: 'failed',
            path: ['All tests', 'Signing In', '1:when I fill in the login form'],
            error: {
              message: 'this step failed',
            }
          }
        }).first());
      });

      it('sends a failed event for the entire test', async () => {
        await actions.fork(results.match({
          event: {
            type: 'test:result',
            status: 'failed',
            path: ['All tests', 'Signing In'],
          }
        }).first());
      });

      it('sends a disregarded event for the remaining steps', async () => {
        await actions.fork(results.match({
          event: {
            type: 'step:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', '2:when I press the submit button'],
          }
        }).first());
      });

      it('sends a disregarded event for the remaining assertions', async () => {
        await actions.fork(results.match({
          event: {
            type: 'assertion:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'then I am logged in'],
          }
        }).first());
      });

      it('sends a disregarded event for the remaining children', async () => {
        await actions.fork(results.match({
          event: {
            type: 'test:result',
            status: 'disregarded',
            path: ['All tests', 'Signing In', 'when I log out'],
          }
        }).first());
      })

    });
  });
});

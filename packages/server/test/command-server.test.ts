import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Mailbox } from '@bigtest/effection';
import { Slice } from '@bigtest/atom';
import { Test } from '@bigtest/suite';

import { Client } from '../src/client';
import { actions } from './helpers';
import { createCommandServer } from '../src/command-server';
import { createOrchestratorAtom } from '../src/orchestrator/atom';

import { AgentState, OrchestratorState } from '../src/orchestrator/state';

let COMMAND_PORT = 24200;

describe('command server', () => {
  let delegate: Mailbox
  let agents: Slice<Record<string, AgentState>, OrchestratorState>;
  let manifest: Slice<Test, OrchestratorState>;

  beforeEach(async () => {
    delegate = new Mailbox();
    let atom = createOrchestratorAtom();
    agents = atom.slice<Record<string, AgentState>>(['agents']);
    manifest = atom.slice<Test>(['manifest']);
    actions.fork(createCommandServer({
      delegate,
      atom,
      port: COMMAND_PORT,
    }));

    await actions.receive(delegate, { status: 'ready' });
  });

  describe('fetching the agents at the start', () => {
    let result: unknown;
    beforeEach(async () => {
      result = await query('agents { browser { name } }');
    });

    it('contains an empty list', () => {
      expect(result).toEqual({ "data": { "agents": [] } });
    });
  });

  describe('running the entire suite', () => {
    let result: unknown;
    beforeEach(async () => {
      result = await mutation('run');
    });

    it('returns a test run id', () => {
      expect(result['data'].run).toMatch('TestRun');
    });

    it('sends a message to the orchestrator telling it to start the test run', async () => {
      let message = await actions.receive(delegate, { type: "run" });
      expect(message['type']).toEqual("run")
      expect(message['id']).toEqual(result['data'].run)
    });
  });

  describe('querying connected agents', () => {
    let result: unknown;
    beforeEach(async () => {
      agents.set({
        safari: {
          "agentId": "agent.1",
          "browser": {
            "name": "Safari",
            "version": "13.0.4"
          },
          "os": {
            "name": "macOS",
            "version": "10.15.2",
            "versionName": "Catalina"
          },
          "platform": {
            "type": "desktop",
            "vendor": "Apple"
          },
          "engine": {
            "name": "Gecko",
            "version": "5.0"
          }
        }
      });
      result = await query('agents { browser { name } os { name } platform { type }}');
    });
    it('contains the agents', () => {
      expect(result).toEqual({
        data: {
          agents: [
            {
              browser: { name: "Safari" },
              os: { name: "macOS" },
              platform: { type: "desktop" }
            }
          ]
        }
      })
    });

    describe('over websockets', () => {
      let wsResult: unknown;
      beforeEach(async () => {
        wsResult = await websocketQuery('{agents { browser { name } os { name } platform { type }}}');
      });

      it('gets the same results as over http', () => {
        expect(wsResult).toEqual(result['data']);
      });
    });

  });

  describe('querying the manifest', () => {
    let result: unknown;

    let test1: Test, test2: Test;
    beforeEach(async () => {
      test1 = {
        description: "First Test",
        steps: [{
          description: "Do the thing",
        }],
        children: [{
          description: "Son of First Test",
          steps: [],
          children: [],
          assertions: []
        }],
        assertions: [{
          description: "It did the thing",
        }]
      };

      test2 = {
        description: "Second Test",
        steps: [],
        children: [],
        assertions: []
      };

      manifest.set({
        description: "All Tests",
        steps: [],
        assertions: [],
        children: [test1, test2]
      });
    });

    beforeEach(async () => {
      result = await query(`
        manifest {
          description
          children {
            description
            children {
              description
            }
          }
        }
      `);
    });

    it('contains the test tree', () => {
      expect(result).toMatchObject({
        data: {
          manifest: {
            description: "All Tests",
            children: [{
              description: "First Test",
              children: [{
                description: "Son of First Test"
              }]
            }, {
              description: "Second Test"
            }]
          }
        }
      })
    });
  });

  describe('subscribing to a query', () => {
    let client: Client;
    let subscription: Mailbox;
    let initial: unknown;

    beforeEach(async () => {
      client = await actions.fork(Client.create(`ws://localhost:${COMMAND_PORT}`));
      subscription = await actions.fork(client.subscribe('{ agents { browser { name } } }'));
      initial = await actions.fork(subscription.receive());
    });

    it('contains the initial result of the query', () => {
      expect(initial).toEqual({ agents: [] });
    });

    describe('when another agent is added', () => {
      let second: unknown;

      beforeEach(async () => {
        agents.set({
          safari: {
            "agentId": "agent.1",
            "browser": {
              "name": "Safari",
              "version": "13.0.4"
            },
            "os": {
              "name": "macOS",
              "version": "10.15.2",
              "versionName": "Catalina"
            },
            "platform": {
              "type": "desktop",
              "vendor": "Apple"
            },
            "engine": {
              "name": "Gecko",
              "version": "5.0"
            }
          }
        });
        second = await actions.fork(subscription.receive());
      });

      it('publishes the new state', () => {
        expect(second).toBeDefined();
        expect(second).toEqual({
          agents: [{
            browser: {
              name: "Safari"
            }
          }]
        });
      });
    });
  });
});

async function query(text: string): Promise<unknown> {
  let response = await actions.fetch(`http://localhost:${COMMAND_PORT}?query={${encodeURIComponent(text)}}`);
  return await response.json();
}

async function mutation(text: string): Promise<unknown> {
  let body = `mutation { ${text} }`
  let response = await actions.fetch(`http://localhost:${COMMAND_PORT}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query: body })
  });
  return await response.json();
}

async function websocketQuery(text: string) {
  return await actions.fork(function*() {
    let client = yield Client.create(`ws://localhost:${COMMAND_PORT}`);
    return yield client.query(text);
  });
}

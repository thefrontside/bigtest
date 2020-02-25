import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Operation } from 'effection';
import { Mailbox } from '@effection/events';

import { Client } from '../src/client';
import { actions } from './helpers';
import { createCommandServer } from '../src/command-server';
import { Atom, Slice } from '../src/orchestrator/atom';

import { Test } from '../src/test';
import { AgentState } from 'src/orchestrator/state';

let COMMAND_PORT = 24200;

describe('command server', () => {
  let delegate: Mailbox
  let agents: Slice<Record<string, AgentState>>;
  let manifest: Slice<Test>;

  beforeEach(async () => {
    delegate = new Mailbox();
    let atom = new Atom();
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
    let result: Array<any>;
    beforeEach(async () => {
      result = await query('agents { browser { name } }');
    });

    it('contains an empty list', () => {
      expect(result).toEqual({ "data": { "agents": [] } });
    });
  });

  describe('running the entire suite', () => {
    let result: any;
    beforeEach(async () => {
      result = await mutation('run');
    });

    it('returns a test run id', () => {
      expect(result.data.run).toMatch('test-run');
    });

    it('sends a message to the orchestrator telling it to start the test run', async () => {
      let message = await actions.receive(delegate, { type: "run" });
      expect(message.type).toEqual("run")
      expect(message.id).toEqual(result.data.run)
    });
  });

  describe('querying connected agents', () => {
    let result: unknown;
    beforeEach(async () => {
      agents.set({
        safari: {
          "identifier": "agent.1",
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
    let result: { data: { manifest: Array<{ path: string; test: string }> } };

    async function nothing() {}
    let test1: Test, test2: Test;
    beforeEach(async () => {
      test1 = {
        description: "First Test",
        path: 'foo.js',
        steps: [{
          description: "Do the thing",
          action: nothing
        }],
        children: [{
          description: "Son of First Test",
          steps: [],
          children: [],
          assertions: []
        }],
        assertions: [{
          description: "It did the thing",
          check: nothing
        }]
      };

      test2 = {
        description: "Second Test",
        path: 'bar.js',
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
            path
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
              path: 'foo.js',
              description: "First Test",
              children: [{
                description: "Son of First Test"
              }]
            }, {
              path: 'bar.js',
              description: "Second Test"
            }]
          }
        }
      })
    });
  });

  describe('subscribing to a query', () => {
    let results: unknown[];
    let sync: Mocha.Done;

    beforeEach((done) => {
      sync = done;
      actions.fork(function*() {
        results = [];
        let client: Client = yield createTestClient();
        yield client.subscribe('{ agents { browser { name } } }', function*(data) {
          results.push(data);
          sync();
        });
      })
    });

    it('contains the initial result of the query', () => {
      expect(results).toEqual([{ agents: [] }]);
    });

    describe('when another agent is added', () => {
      beforeEach((done) => {
        sync = done;
        agents.set({
          safari: {
            "identifier": "agent.1",
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
      });

      it('publishes the new state', () => {
        let [, second] = results;
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

// eslint-disable-next-line @typescript/no-explicit-any
async function query(text: string): Promise<any> {
  let response = await actions.fetch(`http://localhost:${COMMAND_PORT}?query={${encodeURIComponent(text)}}`);
  return await response.json();
}

// eslint-disable-next-line @typescript/no-explicit-any
async function mutation(text: string): Promise<any> {
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

const createTestClient: () => Operation = () => Client.create(`ws://localhost:${COMMAND_PORT}`);

async function websocketQuery(text: string) {
  return await actions.fork(function*() {
    let client = yield createTestClient();
    return yield client.query(text);
  });
}

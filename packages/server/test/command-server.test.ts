import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import { Operation, createQueue, Queue, Subscription, spawn, fetch } from 'effection';
import { Slice } from '@effection/atom';
import { Test } from '@bigtest/suite';
import { createClient, Client } from '@bigtest/client';
import { createCommandServer } from '../src/command-server';
import { createOrchestratorAtom } from '../src/orchestrator/atom';
import { AgentState, Manifest } from '../src/orchestrator/state';
import { RunOptions } from '../src/runner';

let COMMAND_PORT = 24200;

describe('command server', () => {
  let agents: Slice<Record<string, AgentState>>;
  let manifest: Slice<Manifest>;
  let runs: Queue<RunOptions>;

  beforeEach(function*() {
    runs = createQueue();
    let atom = createOrchestratorAtom();
    agents = atom.slice('agents');
    manifest = atom.slice('manifest');

    yield spawn(createCommandServer({
      status: atom.slice('commandServer'),
      runner: {
        async runTest(options) {
          runs.send(options);
        },
        async *subscribe() {
          throw new Error('not implemented');
        }
      },
      atom,
      port: COMMAND_PORT,
    }));

    yield atom.slice('commandServer').match({ type: 'started' }).expect();
  });

  describe('fetching the agents at the start', () => {
    let result: unknown;
    beforeEach(function*() {
      result = yield query('agents { browser { name } }');
    });

    it('contains an empty list', function*() {
      expect(result).toEqual({ 'data': { 'agents': [] } });
    });
  });

  describe('running the entire suite', () => {
    let result: GraphQLPayload<{run: unknown}>;
    beforeEach(function*() {
      result = yield mutation('run');
    });

    it('returns a test run id', function*() {
      expect(result.data.run).toMatch('TestRun');
    });

    it('sends a message to the orchestrator telling it to start the test run', function*() {
      let message = yield runs.expect();
      expect(message.testRunId).toEqual(result.data.run)
    });
  });

  describe('querying connected agents', () => {
    let result: GraphQLPayload;
    beforeEach(function*() {
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
      result = yield query('agents { browser { name } os { name } platform { type }}');
    });
    it('contains the agents', function*() {
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
      let wsResult: GraphQLPayload;
      beforeEach(function*() {
        wsResult = yield websocketQuery('{agents { browser { name } os { name } platform { type }}}');
      });

      it('gets the same results as over http', function*() {
        expect(wsResult).toEqual(result['data']);
      });
    });

  });

  describe('querying the manifest', () => {
    let result: unknown;

    let test1: Test, test2: Test;
    beforeEach(function*() {
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
        fileName: 'blah',
        description: "All Tests",
        steps: [],
        assertions: [],
        children: [test1, test2]
      });
    });

    beforeEach(function*() {
      result = yield query(`
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

    it('contains the test tree', function*() {
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

  describe('subscribing to a live query', () => {
    let client: Client;
    let subscription: Subscription<unknown>;
    let initial: unknown;

    beforeEach(function*(world) {
      client = yield createClient(`ws://localhost:${COMMAND_PORT}`);
      subscription = client.liveQuery('{ agents { browser { name } } }').subscribe(world);
      initial = yield subscription.expect();
    });

    it('contains the initial result of the query', function*() {
      expect(initial).toEqual({ agents: [] });
    });

    describe('when another agent is added', () => {
      let second: unknown;

      beforeEach(function*() {
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
        second = yield subscription.first();
      });

      it('publishes the new state', function*() {
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

interface GraphQLPayload<T = unknown> {
  data: T;
}

function query<T>(text: string): Operation<GraphQLPayload<T>> {
  return function*() {
    return yield fetch(`http://localhost:${COMMAND_PORT}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: `query { ${text} }`
      })
    }).json();
  }
}

function mutation<T>(text: string): Operation<GraphQLPayload<T>> {
  return function*() {
    return yield fetch(`http://localhost:${COMMAND_PORT}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: `mutation { ${text} }`
      })
    }).json();
  }
}

function* websocketQuery(text: string): Operation<unknown> {
  let client: Client = yield createClient(`ws://localhost:${COMMAND_PORT}`);
  return yield client.query(text);
}

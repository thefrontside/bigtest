import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Operation } from 'effection';
import { Mailbox } from '@effection/events';

import { Client } from '../src/client';
import { actions } from './helpers';
import { createCommandServer } from '../src/command-server';
import { Atom } from '../src/orchestrator/atom';
import { assoc } from 'ramda';

import { Test } from '../src/test';

let COMMAND_PORT = 24200;

describe('command server', () => {
  let delegate: Mailbox
  let atom: Atom;

  beforeEach(async () => {
    delegate = new Mailbox();
    atom = new Atom();

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
      atom.update(assoc('agents', {
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
      }));
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
        steps: [],
        children: [],
        assertions: []
      };

      atom.update(assoc('manifest', {
        url: 'http://bigmanifest.com',
        entries: [
          { path: "foo.js", test: test1 },
          { path: "bar.js", test: test2 }
        ],
      }));
      result = await query(`
manifest {
  url
  sources
  suite {
    id
    description
    children {
      id description
      children {
        id description
      }
    }
  }
}
`);
    });

    it('contains the paths of the tests', () => {
      expect(result).toMatchObject({
        data: {
          manifest: {
            sources: [
              "foo.js",
              "bar.js"
            ]
          }
        }
      })
    });

    it('contains the test tree', () => {
      expect(result).toMatchObject({
        data: {
          manifest: {
            suite: {
              id: "",
              description: "All Tests",
              children: [{
                id: "First Test",
                description: "First Test",
                children: [{
                  id: "First Test > Son of First Test",
                  description: "Son of First Test"
                }]
              }, {
                id: "Second Test",
                description: "Second Test"
              }]
            }
          }
        }
      })
      // let [first, second]: Array<> = result.data.manifest.map(m => JSON.parse(m.test));

      // expect(first.description).toEqual('First Test');
      // expect(first.steps).toEqual([ { description: "Do the thing" }]);
      // expect(first.children).toMatchObject([ { description: "Son of First Test" }]);
      // expect(first.assertions).toMatchObject([ { description: "It did the thing" }]);

      // expect(second.description).toEqual('Second Test');
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
        atom.update(assoc('agents', {
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
        }));
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

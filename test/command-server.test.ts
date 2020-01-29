import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Context } from 'effection';

import { actions } from './helpers';
import { createCommandServer } from '../src/command-server';
import { State } from '../src/orchestrator/state';

let COMMAND_PORT = 24200;

describe('command server', () => {
  let orchestrator: Context;
  let state: State;

  beforeEach(async () => {
    orchestrator = actions.fork(function*() { yield });
    state = new State();

    actions.fork(createCommandServer(orchestrator, {
      port: COMMAND_PORT,
      state
    }));

    await actions.receive(orchestrator, { ready: "command" });
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

  describe('querying connected agents', () => {
    let result: Array<any>;
    beforeEach(async () => {
      state.update(() => ({
        agents: {
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
  });

});

async function query(text: string) {
  let response = await actions.get(`http://localhost:${COMMAND_PORT}?query={${encodeURIComponent(text)}}`);
  return await response.json();
}

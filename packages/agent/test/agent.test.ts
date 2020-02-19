import { main, Operation, Context } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import fetch from 'node-fetch';
import { AgentServer } from '../index';

describe("@bigtest/agent", () => {

  let World: Context;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World["spawn"](operation);
  }

  beforeEach(() => {
    World = main(undefined);
  });

  afterEach(() => {
    World.halt();
  });

  describe('starting a new server', () => {
    let server: AgentServer;
    beforeEach(async () => {
      server = await spawn(AgentServer.create());
    });

    it('has an agent url where it will server the agent application', () => {
      expect(server.harnessScriptURL).toBeDefined();
    });

    it('can genenrate the full connect URL', () => {
      expect(server.connectURL('ws://websocket-server.com')).toContain('websocket-server');
    });

    describe('fetching the harness', () => {
      let harnessBytes: string;
      beforeEach(async () => {
        let response = await fetch(server.harnessScriptURL);
        harnessBytes = await response.text();
      });

      it('has the javascripts', () => {
        expect(harnessBytes).toContain('harness');
      });
    });

  });

  describe('starting a server on a specific port', () => {
    let server: AgentServer

    beforeEach(async () => {
      server = await spawn(AgentServer.create(8000));
    });

    it('starts the server on the correct port', () => {
      expect(server.connectURL('')).toContain('http://localhost:8000');
    });
  });

  describe('a proxy development server', () => {
    let server: AgentServer;
    beforeEach(async () => {
      server = await spawn(AgentServer.external('http://host.com'));
    });

    it('appends the pre-configured connect back url', () => {
      expect(server.connectURL('ws://localhost:5000')).toEqual(`http://host.com/?connectTo=${encodeURIComponent('ws://localhost:5000')}`);
    });
  });
});

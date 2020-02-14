import { main, Operation, Context } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import fetch, { Response } from 'node-fetch';
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
      server = await spawn(AgentServer.create('ws://localhost:5500'));
    });

    it('has a harness url where it will serve the harness script', () => {
      expect(server.agentAppURL).toBeDefined();
    });
    it('has an agent url where it will server the agent application', () => {
      expect(server.harnessScriptURL).toBeDefined();
    });

    describe('reqeusting the agent app without a connect back url', () => {
      let response: Response;

      beforeEach(async () => {
        response = await fetch(server.agentAppURL);
      });


      it('redirects to itself wit the connect back url', () => {
        expect(response.redirected).toEqual(true);
        expect(response.url).toEqual(`${server.agentAppURL}/?connectTo=ws://localhost:5500`);
      });
    });

    describe('requesting with a connect back url', () => {
      let response: Response;

      beforeEach(async () => {
        response = await fetch(`${server.agentAppURL}/?connectTo=ws://localhost:8000`);
      });

      it('does not redirect', () => {
        expect(response.redirected).toEqual(false);
      });
    });
  });

  describe('starting a server on a specific port', () => {
    let server: AgentServer

    beforeEach(async () => {
      server = await spawn(AgentServer.create('ws://localhost:5500', 8000));
    });

    it('starts the server on the correct port', () => {
      expect(server.agentAppURL).toEqual('http://localhost:8000');
    });
  });

  describe('a proxy development server', () => {
    let server: AgentServer;
    beforeEach(async () => {
      server = await spawn(AgentServer.external('http://host.com', 'ws://localhost:5000'));
    });

    it('appends the pre-configured connect back url', () => {
      expect(server.agentAppURL).toEqual('http://host.com/?connectTo=ws://localhost:5000');
    });
  });

})

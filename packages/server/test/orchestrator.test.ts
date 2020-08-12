import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import { ChildProcess } from '@effection/node'

import { Response } from 'node-fetch';

import { actions } from './helpers';

describe.only('orchestrator', () => {
  beforeEach(async function() {
    this.timeout(20000);
    await actions.startOrchestrator();
  });

  describe('connecting to the command server', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.fetch('http://localhost:24102?query={echo(text:"Hello World")}');
      body = await response.json();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('contains the ping text', () => {
      expect(body).toEqual({"data": {"echo": "Hello World"}})
    });
  });
  
  describe('retrieving test file manifest', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      let name = actions.atom.get().manifest.fileName;
      response = await actions.fetch(`http://localhost:24105/${name}`);
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('serves the application', () => {
      expect(body).toContain('Signing In');
    });
  });

  describe('an unreachable application', () => {
    beforeEach(async () => {
      await actions.fork(function * () {
        yield actions.atom.once(state => state.appService.appStatus === 'unreachable')
      });
    });
    
    it ('indicates that the application is unreachable', () => {
      expect(actions.atom.get().appService.appStatus).toEqual('unreachable');
    });
  
    describe('retrieving app via proxy', () => {
      let response: Response;

      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24101/');
      });
  
      it('responds with a server error', () => {
        expect(response.status).toEqual(502);
      });
    });
  });

  describe('an externally managed application', () => {
    beforeEach(async function() {
      await actions.fork(function * () {
        let child = yield ChildProcess.spawn("yarn test:app:start 24100");

        actions.registerAfterDestroyPromise(
          new Promise(resolve => {
            child.on('exit', () => setTimeout(resolve, 100));
          })
        );

        return child;
      });

      await actions.fork(function* () {
        return yield actions.atom.once(state => {
          return state.appService.appStatus === 'reachable'
        });
      });
    });

    describe('retrieving app', () => {
      let response: Response;

      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24100/');
      });
  
      it('responds successfully', () => {
        expect(response.ok).toEqual(true);
      });
    });
    
    describe('retrieving app via proxy', () => {
      let response: Response;

      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24101/');
      });
  
      it('responds successfully', () => {
        expect(response.status).toEqual(200);
      });
    });
  });

  describe('running the application command', () => {
    beforeEach(async function() {
      actions.updateApp({
        url: "http://localhost:24100",
        command: "yarn test:app:start 24100"
      });

      await actions.fork(function* () {
        yield actions.atom.once(state => {
          return state.appService.appStatus === 'reachable'
        });
      });
    });
  
    describe('retrieving agent from proxy server', () => {
      let response: Response;
      let body: string;
      
      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24101/__bigtest/index.html');
        body = await response.text();
      });
  
      it('responds successfully', () => {
        expect(response.ok).toEqual(true);
      });
  
      it('returns the agent html', () => {
        expect(body).toContain('<title>BigTest</title>');
      });
    });
  
    describe('retrieving harness', () => {
      let response: Response;
      let body: string;
      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24101/__bigtest/harness.js');
        body = await response.text();
      });
  
      it('responds successfully', () => {
        expect(response.ok).toEqual(true);
      });
  
      it('returns the harness script', () => {
        expect(body).toContain('harness');
      });
    });
  
    describe('retrieving app', () => {
      let response: Response;
      let body: string;
      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24100/');
        body = await response.text();
      });
  
      it('responds successfully', () => {
        expect(response.ok).toEqual(true);
      });
  
      it('serves the application', () => {
        expect(body).toContain('<title>React TodoMVC Example</title>');
      });
    });
  
    describe('retrieving app via proxy', () => {
      let response: Response;
      let body: string;
      beforeEach(async () => {
        response = await actions.fetch('http://localhost:24101/');
        body = await response.text();
      });
  
      it('responds successfully', () => {
        expect(response.ok).toEqual(true);
      });
  
      it('proxies to the application', () => {
        expect(body).toContain('<title>React TodoMVC Example</title>');
      });
  
      it('injects the harness script tag', () => {
        expect(body).toMatch(new RegExp(`<script src="http://localhost:\\d+/__bigtest/harness.js"></script>`, 'mg'));
      });
    });
  });
});

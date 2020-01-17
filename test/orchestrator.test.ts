import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Response } from 'node-fetch';

import { actions } from './helpers';

describe('orchestrator', () => {
  beforeEach(async function() {
    this.timeout(20000);
    await actions.startOrchestrator();
  });

  describe('connecting to the command server', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.get('http://localhost:24102');
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('contains the ping text', () => {
      expect(body).toContain('Your wish is my command');
    });
  });

  describe('retrieving agent', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.get('http://localhost:24104/index.html');
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
      response = await actions.get('http://localhost:24104/harness.js');
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('returns the harness script', () => {
      // TODO: we should probably assert on something more sensible here, but on what?
      expect(body).toContain('hello from harness');
    });
  });

  describe('retrieving app', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.get('http://localhost:24100/');
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
      response = await actions.get('http://localhost:24101/');
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('proxies to the application', () => {
      expect(body).toContain('<title>React TodoMVC Example</title>');
    });

    it('injects the harness script tag', () => {
      expect(body).toContain('<script src="http://localhost:24104/harness.js"></script>');
    });
  });
});

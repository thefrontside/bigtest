import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';
import { daemon } from '@effection/process'
import { Slice } from '@effection/atom'
import getPort from 'get-port';
import fetch, { Response } from 'node-fetch';

import { startOrchestrator } from './helpers';
import { OrchestratorState } from '../src/orchestrator/state';

describe('orchestrator', () => {
  let atom: Slice<OrchestratorState>;

  beforeEach(function*() {
    this.timeout(20000);
    atom = yield startOrchestrator();
  });

  describe('connecting to the command server', () => {
    let response: Response;
    let body: string;
    beforeEach(function*() {
      response = yield fetch('http://localhost:24102?query={echo(text:"Hello World")}');
      body = yield response.json();
    });

    it('responds successfully', function*() {
      expect(response.ok).toEqual(true);
    });

    it('contains the ping text', function*() {
      expect(body).toEqual({"data": {"echo": "Hello World"}})
    });
  });

  describe('retrieving agent from proxy server', () => {
    let response: Response;
    let body: string;

    beforeEach(function*() {
      response = yield fetch('http://localhost:24001/__bigtest/index.html');
      body = yield response.text();
    });

    it('responds successfully', function*() {
      expect(response.ok).toEqual(true);
    });

    it('returns the agent html', function*() {
      expect(body).toContain('<title>BigTest</title>');
    });
  });

  describe('retrieving harness', () => {
    let response: Response;
    let body: string;
    beforeEach(function*() {
      response = yield fetch('http://localhost:24001/__bigtest/harness.js');
      body = yield response.text();
    });

    it('responds successfully', function*() {
      expect(response.ok).toEqual(true);
    });

    it('returns the harness script', function*() {
      expect(body).toContain('harness');
    });
  });

  describe('retrieving test file manifest', () => {
    let response: Response;
    let body: string;
    beforeEach(function*() {
      yield atom.slice('bundler').match({ type: 'GREEN' }).expect();

      let name = atom.get().manifest.fileName;
      response = yield fetch(`http://localhost:24105/${name}`);
      body = yield response.text();
    });

    it('responds successfully', function*() {
      expect(response.ok).toEqual(true);
    });

    it('serves the application', function*() {
      expect(body).toContain('Signing In');
    });
  });
});

describe('orchestrator with an internally managed application', () => {
  let atom: Slice<OrchestratorState>;

  beforeEach(function*() {
    this.timeout(20000);

    atom = yield startOrchestrator({
      app: {
        url: `http://localhost:24100`,
        command: "yarn test:app:start 24100",
      }
    });

    yield atom.slice('appServer').filter(status => ['started', 'exited'].includes(status.type)).expect();

    yield atom.slice('appServer').match({ type: 'available' }).expect();
  });

  describe('retrieving app', () => {
    let response: Response;
    let body: string;
    beforeEach(function*() {
      yield atom.slice('appServer').match({ type: 'available' }).expect();

      response = yield fetch('http://localhost:24100/');
      body = yield response.text();
    });

    it('serves the application', function*() {
      expect(response.ok).toEqual(true);
    });

    it('proxies to the application', function*() {
      expect(body).toContain('<title>Test App</title>');
    });
  });

  describe('retrieving app via proxy', () => {
    let response: Response;
    let body: string;
    beforeEach(function*() {
      yield atom.slice('appServer').match({ type: 'available' }).expect();

      response = yield fetch('http://localhost:24001/');
      body = yield response.text();
    });

    it('responds successfully', function*() {
      expect(response.ok).toEqual(true);
    });

    it('proxies to the application', function*() {
      expect(body).toContain('<title>Test App</title>');
    });

    it('injects the harness script tag', function*() {
      expect(body).toMatch(new RegExp(`<script src="http://localhost:\\d+/__bigtest/harness.js"></script>`, 'mg'));
    });
  });
});

describe('orchestrator with an externally managed application', () => {
  let port: number;
  let atom: Slice<OrchestratorState>;

  beforeEach(function*() {
    this.timeout(20000);

    port = yield getPort();

    atom = yield startOrchestrator({
      app: {
        url: `http://localhost:${port}`,
        command: undefined,
      }
    });

    yield atom.slice('appServer').filter(status => ['started', 'exited'].includes(status.type)).expect();

    yield daemon(`yarn test:app:start ${port}`);

    yield atom.slice('appServer').match({ type: 'available' }).expect();
  });

  describe('retrieving app', () => {
    let response: Response;

    beforeEach(function*() {
      response = yield fetch(`http://localhost:${port}/`);
    });

    it('responds successfully', function*() {
      expect(response.ok).toEqual(true);
    });
  });

  describe('retrieving app via proxy', () => {
    let response: Response;

    beforeEach(function*() {
      response = yield fetch('http://localhost:24001/');
    });

    it('responds successfully', function*() {
      expect(response.status).toEqual(200);
    });
  });
});

import { describe, beforeEach, it } from 'mocha';
import expect from 'expect';
import { daemon } from '@effection/node'
import getPort from 'get-port';
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

  describe('retrieving agent from proxy server', () => {
    let response: Response;
    let body: string;

    beforeEach(async () => {
      response = await actions.fetch('http://localhost:24001/__bigtest/index.html');
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
      response = await actions.fetch('http://localhost:24001/__bigtest/harness.js');
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('returns the harness script', () => {
      expect(body).toContain('harness');
    });
  });

  describe('retrieving test file manifest', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      await actions.fork(actions.atom.slice('bundler', 'type').once(type => type === 'GREEN'));

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
});

describe('orchestrator with an internally managed application', () => {
  beforeEach(async function() {
    this.timeout(20000);

    await actions.startOrchestrator({
      app: {
        url: `http://localhost:24100`,
        command: "yarn test:app:start 24100",
      }
    });

    await actions.fork(
      actions.atom.slice('appServer').once(status => ['started', 'exited'].includes(status.type))
    );

    await actions.fork(
      actions.atom.slice('appServer').once(status => status.type === 'available')
    );
  });

  describe('retrieving app', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      await actions.fork(actions.atom.slice('appServer').once(status => status.type === 'available'));

      response = await actions.fetch('http://localhost:24100/');
      body = await response.text();
    });

    it('serves the application', () => {
      expect(response.ok).toEqual(true);
    });

    it('proxies to the application', () => {
      expect(body).toContain('<title>Test App</title>');
    });
  });

  describe('retrieving app via proxy', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      await actions.fork(actions.atom.slice('appServer').once(status => status.type === 'available'));

      response = await actions.fetch('http://localhost:24001/');
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('proxies to the application', () => {
      expect(body).toContain('<title>Test App</title>');
    });

    it('injects the harness script tag', () => {
      expect(body).toMatch(new RegExp(`<script src="http://localhost:\\d+/__bigtest/harness.js"></script>`, 'mg'));
    });
  });
});

describe('orchestrator with an externally managed application', () => {
  let port: number;

  beforeEach(async function() {
    this.timeout(20000);

    port = await getPort();

    await actions.startOrchestrator({
      app: {
        url: `http://localhost:${port}`,
        command: undefined,
      }
    });

    await actions.fork(
      actions.atom.slice('appServer').once(status => ['started', 'exited'].includes(status.type))
    );

    await actions.fork(daemon(`yarn test:app:start ${port}`));

    await actions.fork(
      actions.atom.slice('appServer').once(status => status.type === 'available')
    );
  });

  describe('retrieving app', () => {
    let response: Response;

    beforeEach(async () => {
      response = await actions.fetch(`http://localhost:${port}/`);
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });
  });

  describe('retrieving app via proxy', () => {
    let response: Response;

    beforeEach(async () => {
      response = await actions.fetch('http://localhost:24001/');
    });

    it('responds successfully', () => {
      expect(response.status).toEqual(200);
    });
  });
});

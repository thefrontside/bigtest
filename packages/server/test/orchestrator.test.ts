import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import { daemon } from '@effection/node'
import * as getPort from 'get-port';
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
      response = await actions.fetch('http://localhost:24001/');
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

  describe('an externally managed application', () => {
    let port: number;

    beforeEach(async function() {
      port = await getPort();

      actions.updateApp({ url: `http://localhost:${port}` });

      await actions.fork(
        actions.atom.slice()('appService', 'status').once(status => {
          return ['started', 'exited'].includes(status.type);
        })
      );

      await actions.fork(daemon(`yarn test:app:start ${port}`));

      await actions.fork(
        actions.atom.slice('appService', 'status').once(status => {
          return status.type === 'available'
        })
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
});

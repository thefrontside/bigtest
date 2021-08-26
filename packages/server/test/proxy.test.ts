import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';

import { gzipSync } from 'zlib';

import { Resource, spawn } from 'effection';
import { createAtom, Slice } from '@effection/atom';
import { fetch } from '@effection/fetch';
import { AgentServerConfig } from '@bigtest/agent';

import { proxyServer } from '../src/proxy';
import { ProxyServerStatus } from '../src/orchestrator/state';
import { express, Express } from '@bigtest/effection-express';

const PROXY_PORT = 24202;
const APP_PORT = 24203;

function createAppServer(): Resource<Express> {
  return {
    *init() {
      let appServer: Express = yield express();

      appServer.get('/simple', (req, res) => function*() {
        res.set({ 'Content-Type': 'text/html' });
        res.send('<!doctype html><html><head></head><body><h1>Hello world</h1></body></html>');
      });

      appServer.get('/redirect', (req, res) => function*() {
        res.redirect(`http://localhost:${APP_PORT}/simple`);
      });

      appServer.get('/zipped', (req, res) => function*() {
        res.set({ 'Content-Type': 'text/html', 'Content-Encoding': 'gzip' });
        res.send(gzipSync('<!doctype html><html><head></head><body><h1>Hello zip world</h1></body></html>'));
      });

      appServer.get('/asset', (req, res) => function*() {
        res.set({ 'Content-Type': 'text/plain' });
        res.send('<!doctype html><html><head></head><body><h1>Hello world</h1></body></html>');
      });

      yield appServer.listen(APP_PORT);

      return appServer;
    }
  }
}

describe('proxy', () => {
  let status: Slice<ProxyServerStatus>;
  let agentServerConfig: AgentServerConfig;

  describe('with working app server', () => {
    beforeEach(function*() {
      yield createAppServer();

      agentServerConfig = new AgentServerConfig({ port: PROXY_PORT, prefix: '/__bigtest/' });
      status = createAtom({ type: 'unstarted' } as ProxyServerStatus);

      yield spawn(proxyServer({
        status,
        target: `http://localhost:${APP_PORT}`,
        port: PROXY_PORT,
        agentServerConfig,
      }));

      yield status.match({ type: 'started' }).expect();
    });

    describe('retrieving html file', () => {
      let response: Response;
      let body: string;

      beforeEach(function*() {
        this.timeout(0);

        response = yield fetch(`http://localhost:${PROXY_PORT}/simple`);
        body = yield response.text();
      });

      it('injects the harness script', function*() {
        expect(response.status).toEqual(200);
        expect(body).toContain('<h1>Hello world</h1>');
        expect(body).toContain('<script src="http://localhost:24202/__bigtest/harness.js"></script>');
      });
    });

    describe('retrieving gzipped html file', () => {
      let response: Response;
      let body: string;

      beforeEach(function*() {
        response = yield fetch(`http://localhost:${PROXY_PORT}/zipped`);
        body = yield response.text();
      });

      it('decodez zip and injects the harness script', function*() {
        expect(response.status).toEqual(200);
        expect(body).toContain('<h1>Hello zip world</h1>');
        expect(body).toContain('<script src="http://localhost:24202/__bigtest/harness.js"></script>');
      });
    });

    describe('hitting a redirect', () => {
      let response: Response;

      beforeEach(function*() {
        response = yield fetch(`http://localhost:${PROXY_PORT}/redirect`, { redirect: 'manual' });
        yield response.text();
      });

      it('rewrites it to stay on the proxy server', function*() {
        expect(response.status).toEqual(302);
        expect(response.headers.get('Location')).toEqual(`http://localhost:${PROXY_PORT}/simple`);
      });
    });

    describe('other asset', () => {
      let response: Response;
      let body: string;

      beforeEach(function*() {
        response = yield fetch(`http://localhost:${PROXY_PORT}/asset`);
        body = yield response.text();
      });

      it('returns it unmodified', function*() {
        expect(response.status).toEqual(200);
        expect(body).toContain('<h1>Hello world</h1>');
        expect(body).not.toContain('script');
      });
    });
  });

  describe('proxy error', () => {
    let response: Response;
    let body: string;

    beforeEach(function*() {
      agentServerConfig = new AgentServerConfig({ port: PROXY_PORT, prefix: '/__bigtest/' });

      status = createAtom({ type: 'unstarted' } as ProxyServerStatus);

      yield spawn(proxyServer({
        status,
        target: `http://localhost:${APP_PORT}`,
        port: PROXY_PORT,
        agentServerConfig,
      }));

      yield status.match({ type: 'started' }).expect();

      response = yield fetch(`http://localhost:${PROXY_PORT}/simple`);
      body = yield response.text();
    });

    it('logs a gatetway error', function*() {
      expect(response.status).toEqual(502);
      expect(body).toContain('Proxy error');
    });
  });
});

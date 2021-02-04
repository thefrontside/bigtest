import { describe, beforeEach, it } from 'mocha';
import expect from 'expect';

import { gzipSync } from 'zlib';

import { Operation } from 'effection';
import { createAtom, Slice } from '@bigtest/atom';
import { fetch } from '@effection/fetch';
import { AgentServerConfig } from '@bigtest/agent';

import { actions } from './helpers';
import { proxyServer } from '../src/proxy';
import { ProxyServerStatus } from '../src/orchestrator/state';
import { express } from '@bigtest/effection-express';

const PROXY_PORT = 24202;
const APP_PORT = 24203;

function* startAppServer(): Operation<void> {
  let appServer = express();

  yield appServer.get('/simple', function*(req, res) {
    res.set({ 'Content-Type': 'text/html' });
    res.send('<!doctype html><html><head></head><body><h1>Hello world</h1></body></html>');
  });

  yield appServer.get('/redirect', function*(req, res) {
    res.redirect(`http://localhost:${APP_PORT}/simple`);
  });

  yield appServer.get('/zipped', function*(req, res) {
    res.set({ 'Content-Type': 'text/html', 'Content-Encoding': 'gzip' });
    res.send(gzipSync('<!doctype html><html><head></head><body><h1>Hello zip world</h1></body></html>'));
  });

  yield appServer.get('/asset', function*(req, res) {
    res.set({ 'Content-Type': 'text/plain' });
    res.send('<!doctype html><html><head></head><body><h1>Hello world</h1></body></html>');
  });

  yield appServer.listen(APP_PORT);

  yield
}

describe('proxy', () => {
  let status: Slice<ProxyServerStatus>;
  let agentServerConfig: AgentServerConfig;

  describe('with working app server', () => {
    beforeEach(async () => {
      actions.fork(startAppServer);

      agentServerConfig = new AgentServerConfig({ port: PROXY_PORT, prefix: '/__bigtest/' });
      status = createAtom({ type: 'unstarted' } as ProxyServerStatus);

      actions.fork(proxyServer({
        status,
        target: `http://localhost:${APP_PORT}`,
        port: PROXY_PORT,
        agentServerConfig,
      }));

      await actions.fork(status.once((s) => s.type === 'started'));
    });

    describe('retrieving html file', () => {
      let response: Response;
      let body: string;

      beforeEach(async () => {
        response = await actions.fork(fetch(`http://localhost:${PROXY_PORT}/simple`));
        body = await actions.fork(response.text());
      });

      it('injects the harness script', () => {
        expect(response.status).toEqual(200);
        expect(body).toContain('<h1>Hello world</h1>');
        expect(body).toContain('<script src="http://localhost:24202/__bigtest/harness.js"></script>');
      });
    });

    describe('retrieving gzipped html file', () => {
      let response: Response;
      let body: string;

      beforeEach(async () => {
        response = await actions.fork(fetch(`http://localhost:${PROXY_PORT}/zipped`));
        body = await actions.fork(response.text());
      });

      it('decodez zip and injects the harness script', () => {
        expect(response.status).toEqual(200);
        expect(body).toContain('<h1>Hello zip world</h1>');
        expect(body).toContain('<script src="http://localhost:24202/__bigtest/harness.js"></script>');
      });
    });

    describe('hitting a redirect', () => {
      let response: Response;

      beforeEach(async () => {
        response = await actions.fork(fetch(`http://localhost:${PROXY_PORT}/redirect`, { redirect: 'manual' }));
        await actions.fork(response.text());
      });

      it('rewrites it to stay on the proxy server', () => {
        expect(response.status).toEqual(302);
        expect(response.headers.get('Location')).toEqual(`http://localhost:${PROXY_PORT}/simple`);
      });
    });

    describe('other asset', () => {
      let response: Response;
      let body: string;

      beforeEach(async () => {
        response = await actions.fork(fetch(`http://localhost:${PROXY_PORT}/asset`));
        body = await actions.fork(response.text());
      });

      it('returns it unmodified', () => {
        expect(response.status).toEqual(200);
        expect(body).toContain('<h1>Hello world</h1>');
        expect(body).not.toContain('script');
      });
    });
  });

  describe('proxy error', () => {
    let response: Response;
    let body: string;

    beforeEach(async () => {
      agentServerConfig = new AgentServerConfig({ port: PROXY_PORT, prefix: '/__bigtest/' });

      status = createAtom({ type: 'unstarted' } as ProxyServerStatus);

      actions.fork(proxyServer({
        status,
        target: `http://localhost:${APP_PORT}`,
        port: PROXY_PORT,
        agentServerConfig,
      }));

      await actions.fork(status.once((s) => s.type === 'started'));

      response = await actions.fork(fetch(`http://localhost:${PROXY_PORT}/simple`));
      body = await actions.fork(response.text());
    });

    it('logs a gatetway error', () => {
      expect(response.status).toEqual(502);
      expect(body).toContain('Proxy error');
    });
  });
});

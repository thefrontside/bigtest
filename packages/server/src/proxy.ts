import { Operation, throwOnErrorEvent, once, on, onEmit, spawn } from 'effection';
import { express, Express } from "@bigtest/effection-express";
import { static as staticMiddleware } from 'express';
import { AgentServerConfig } from '@bigtest/agent';

import proxy from 'http-proxy';
import http from 'http';
import Trumpet from 'trumpet';
import zlib from 'zlib';
import { ProxyServerStatus } from './orchestrator/state';
import { Slice } from '@effection/atom';
import { assert } from 'assert-ts';

interface ProxyServerOptions {
  status: Slice<ProxyServerStatus>;
  target?: string;
  port: number;
  agentServerConfig: AgentServerConfig;
}

type ProxyResEvent = [http.IncomingMessage, http.IncomingMessage, http.ServerResponse];

export const proxyServer = (options: ProxyServerOptions): Operation<void> => function*(proxyTask) {
  function* handleRequest(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse): Operation<void> {
    console.debug('[proxy]', 'start', req.method, req.url);

    for(let [key, value = ''] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'];
    let contentEncoding = proxyRes.headers['content-encoding'];

    yield spawn(throwOnErrorEvent(proxyRes));

    if(proxyRes.headers.location && options.target) {
      let newLocation = proxyRes.headers.location.replace(options.target, `http://localhost:${options.port}`);
      res.setHeader('location', newLocation);
    }

    if(contentType && contentType.split(';')[0] === 'text/html') {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');
      res.removeHeader('last-modified');
      res.removeHeader('etag');

      if (proxyRes.statusCode) {
        res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);
      }

      let tr = new Trumpet();
      let unzip = zlib.createGunzip();

      yield spawn(throwOnErrorEvent(tr));

      yield spawn(function*() {
        yield spawn(throwOnErrorEvent(proxyRes));
        yield once(unzip, 'finish');
      });

      tr.select('head', (node) => {
        let rs = node.createReadStream();
        let ws = node.createWriteStream();
        ws.write(`<script src="${options.agentServerConfig.harnessUrl()}"></script>`);
        rs.pipe(ws);
      });

      if(contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
        proxyRes.pipe(unzip);
        unzip.pipe(tr);
      } else {
        proxyRes.pipe(tr);
      }

      tr.pipe(res);

      try {
        yield once(tr, 'end');
      } finally {
        // tr.close(); there is no close method on Trumpet, how do we not leak it in case of errors?
        unzip.close();
      }
    } else {
      if (proxyRes.statusCode) {
        res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);
      }

      proxyRes.pipe(res);

      yield once(proxyRes, 'end');
    }
    console.debug('[proxy]', 'finish', req.method, req.url);
  };

  options.status.set({ type: 'starting' });

  let proxyServer = proxy.createProxyServer({ target: options.target, selfHandleResponse: true, changeOrigin: true });

  let server: Express = yield express();

  // TODO: validating the config could be done much earlier and in 1 step for the whole config
  assert(!!options.agentServerConfig.options.prefix, 'must set prefix');

  server.raw.use(options.agentServerConfig.options.prefix, staticMiddleware(options.agentServerConfig.appDir()));

  // proxy http requests
  server.use((req, res) => function*() {
    console.debug('[proxy] request', req.method, req.path);
    try {
      yield spawn(function*() {
        let err = yield once<Error>(proxyServer, 'error');
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy error: ${err}`);
        console.debug('[proxy] proxy error', req.method, req.path, err);
      });

      proxyServer.web(req, res)

      yield once(res, 'close');
    } finally {
      req.destroy();
    }
  });

  // proxy ws requests
  server.raw.ws('*', (socket, req) => proxyServer.ws(req, socket, null));

  try {
    yield server.listen(options.port);
    options.status.set({ type: "started" });

    yield spawn(on(proxyServer, 'open').forEach(() => {
      console.debug('[proxy] socket connection opened');
    }));

    yield spawn(on(proxyServer, 'close').forEach(() => {
      console.debug('[proxy] socket connection closed');
    }));

    yield onEmit<ProxyResEvent>(proxyServer, 'proxyRes').forEach(function*([proxyRes, req, res]) {
      yield spawn(handleRequest(proxyRes, req, res), { blockParent: true }).within(proxyTask);
    });
  } finally {
    proxyServer.close();
  }
};


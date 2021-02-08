import { fork, spawn, Operation } from 'effection';
import { throwOnErrorEvent, once, on } from '@effection/events';
import { express } from "@bigtest/effection-express";
import { static as staticMiddleware } from 'express';
import { AgentServerConfig } from '@bigtest/agent';

import proxy from 'http-proxy';
import http from 'http';
import Trumpet from 'trumpet';
import zlib from 'zlib';
import { ProxyServerStatus } from './orchestrator/state';
import { Slice } from '@bigtest/atom';
import { assert } from 'assert-ts';

interface ProxyServerOptions {
  status: Slice<ProxyServerStatus>;
  target?: string;
  port: number;
  agentServerConfig: AgentServerConfig;
}

export function* proxyServer(options: ProxyServerOptions): Operation<void> {
  function* handleRequest(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse): Operation {
    console.debug('[proxy]', 'start', req.method, req.url);

    for(let [key, value = ''] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'];
    let contentEncoding = proxyRes.headers['content-encoding'];

    yield throwOnErrorEvent(proxyRes);

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

      yield throwOnErrorEvent(tr);

      yield spawn(function*() {
        yield throwOnErrorEvent(unzip);
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

  let server = express();

  // TODO: validating the config could be done much earlier and in 1 step for the whole config
  assert(!!options.agentServerConfig.options.prefix, 'must set prefix');

  server.raw.use(options.agentServerConfig.options.prefix, staticMiddleware(options.agentServerConfig.appDir()));

  // proxy http requests
  yield server.use(function*(req, res) {
    try {
      yield spawn(on(proxyServer, 'error').map((args) => args[0] as Error).forEach(function*(err) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy error: ${err}`);
      }));

      proxyServer.web(req, res)

      yield once(res, 'close');
    } finally {
      req.destroy();
    }
  });

  // proxy ws requests
  yield server.ws('*', function*(socket, req) {
    proxyServer.ws(req, socket.raw, null);
  });

  try {
    yield server.listen(options.port);
    options.status.set({ type: "started" });

    yield spawn(on(proxyServer, 'open').forEach(function*() {
      console.debug('[proxy] socket connection opened');
    }));

    yield spawn(on(proxyServer, 'close').forEach(function*() {
      console.debug('[proxy] socket connection closed');
    }));

    let requests = yield on(proxyServer, 'proxyRes');
    while(true) {
      let iter = yield requests.next();
      if(iter.done) {
        break;
      } else {
        let [proxyRes, req, res] = iter.value;
        yield fork(function*() {
          yield handleRequest(proxyRes, req, res);
        });
      }
    }
  } finally {
    proxyServer.close();
  }
};


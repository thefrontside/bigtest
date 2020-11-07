import { fork, spawn, Operation } from 'effection';
import { AgentServerConfig } from '@bigtest/agent';
import { throwOnErrorEvent, once, on } from '@effection/events';
import { express } from "@bigtest/effection-express";
import { static as staticMiddleware } from 'express';
import { restartable } from './effection/restartable'

import * as proxy from 'http-proxy';
import * as http from 'http';
import * as Trumpet from 'trumpet';
import * as zlib from 'zlib';
import { OrchestratorState, AppOptions } from './orchestrator/state';
import { Atom } from '@bigtest/atom';

interface ProxyOptions {
  atom: Atom<OrchestratorState>;
  agentServerConfig: AgentServerConfig;
  port: number;
};

export function createProxyServer(options: ProxyOptions): Operation {
  let appOptions = options.atom.slice()("appService", "appOptions");
  return restartable(appOptions, startProxyServer(options));
}

export const startProxyServer = (options: ProxyOptions) => function* ({ url: target }: AppOptions): Operation {
  function* handleRequest(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse): Operation {
    console.debug('[proxy]', 'start', req.method, req.url);
    for(let [key, value = ''] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    yield throwOnErrorEvent(proxyRes);

    if(proxyRes.headers.location && target) {
      let newLocation = proxyRes.headers.location.replace(target, `http://localhost:${options.port}`);
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

  let proxyStatus = options.atom.slice()("proxyService", "proxyStatus");

  proxyStatus.set("starting");

  let proxyServer = proxy.createProxyServer({ target, selfHandleResponse: true });

  let server = express();

  if(options.agentServerConfig.options.prefix) {
    server.raw.use(options.agentServerConfig.options.prefix, staticMiddleware(options.agentServerConfig.appDir()));
  } else {
    throw new Error('must set prefix');
  }

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
    proxyStatus.set("started");

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


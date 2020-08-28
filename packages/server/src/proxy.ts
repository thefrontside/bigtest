import { fork, spawn, Context, Operation } from 'effection';
import { Mailbox, any } from '@bigtest/effection';
import { AgentServerConfig } from '@bigtest/agent';
import { throwOnErrorEvent, once } from '@effection/events';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { express } from "@bigtest/effection-express";
import { static as staticMiddleware } from 'express';

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
  targetUrl: string;
};

export function* startProxyServer(options: ProxyOptions): Operation {
  function* handleRequest(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse): Operation {
    console.debug('[proxy]', 'start', req.method, req.url);
    for(let [key, value = ''] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    yield throwOnErrorEvent(proxyRes);

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
      yield throwOnErrorEvent(unzip);

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

  let proxyStatus = options.atom.slice("proxyService", "proxyStatus");

  proxyStatus.set("starting");

  let proxyServer = proxy.createProxyServer({
    target: options.targetUrl,
    selfHandleResponse: true
  });

  let events = yield Mailbox.subscribe(proxyServer, ['proxyRes', 'error', 'open', 'close']);

  let server = express();

  if(options.agentServerConfig.options.prefix) {
    server.raw.use(options.agentServerConfig.options.prefix, staticMiddleware(options.agentServerConfig.appDir()));
  } else {
    throw new Error('must set prefix');
  }

  // proxy http requests
  yield server.use(function*(req, res) {
    try {
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

    while(true) {
      let { event, args } = yield events.receive({ event: any("string") });

      if(event == "error") {
        let [err,, res] = args;
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy error: ${err}`);
      }

      if(event == "open") {
        console.debug('[proxy] socket connection opened');
      }

      if(event == "close") {
        console.debug('[proxy] socket connection closed');
      }

      if(event == "proxyRes") {
        let [proxyRes, req, res] = args;
        yield fork(function*() {
          yield handleRequest(proxyRes, req, res);
        });
      }
    }
  } finally {
    proxyServer.close();
  }
};

export function* createProxyServer(options: ProxyOptions): Operation {
  let appOptions = options.atom.slice("appService", "appOptions");
  let current: Context | null = null;

  let subscription: ChainableSubscription<AppOptions, undefined> = yield subscribe(appOptions);

  for(let currentOptions = appOptions.get();;currentOptions = appOptions.get()) {
    if (current) {
      current.halt();
    }

    current = yield spawn(
      startProxyServer({
        ...options,
        targetUrl: appOptions.get()?.url ?? options.targetUrl
      })
    );

    while(true) {
      let next = yield subscription
        .filter(value => currentOptions !== value)
        .first();

      if (next) {
        break;
      }

      // Our test helpers reset the atom before each run
      // This closes the channels, breaking subscriptions
      // We want the app service to stay alive, so we'll re-subscribe
      subscription = yield subscribe(appOptions);
    }
  }
}

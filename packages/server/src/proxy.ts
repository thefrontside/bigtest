import { fork, spawn, Operation } from 'effection';
import { Mailbox, any } from '@bigtest/effection';
import { throwOnErrorEvent, on, once } from '@effection/events';

import * as net from 'net';
import * as proxy from 'http-proxy';
import * as http from 'http';
import * as Trumpet from 'trumpet';
import * as zlib from 'zlib';

import { listen } from './http';

interface ProxyOptions {
  delegate: Mailbox;
  port: number;
  targetPort: number;
  inject?: string;
};

export function* createProxyServer(options: ProxyOptions): Operation {
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
        ws.write(options.inject || '');
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

  let proxyServer = proxy.createProxyServer({
    target: `http://localhost:${options.targetPort}`,
    selfHandleResponse: true
  });

  let events = yield Mailbox.subscribe(proxyServer, ['proxyRes', 'error', 'open', 'close']);

  let server = http.createServer();

  // proxy http requests
  yield spawn(function*(): Operation<void> {
    let subscription = yield on(server, 'request');

    while (true) {
      let [req, res]: [http.IncomingMessage, http.ServerResponse] = yield subscription.next();
      yield spawn(function*() {
        try {
          proxyServer.web(req, res)
          yield once(res, 'close');
        } finally {
          req.destroy();
        }
      });
    }
  });

  // proxy ws requests
  yield spawn(function*(): Operation<void> {
    let subscription = yield on(server, 'upgrade');

    while (true) {
      let [req, socket, head]: [http.IncomingMessage, net.Socket, unknown] = yield subscription.next();
      yield spawn(function*() {
        try {
          proxyServer.ws(req, socket, head);
          yield once(socket, 'close');
        } finally {
          req.destroy();
        }
      });
    }
  });

  try {
    yield listen(server, options.port);
    options.delegate.send({ status: "ready" });

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
    server.close();
  }
};

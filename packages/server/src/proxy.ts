import { fork, Operation } from 'effection';
import { on, watchError, Mailbox, any } from '@effection/events';

import * as proxy from 'http-proxy';
import * as http from 'http';
import * as trumpet from 'trumpet';
import * as zlib from 'zlib';

import { listen } from './http';

interface ProxyOptions {
  delegate: Mailbox;
  port: number;
  targetPort: number;
  inject?: string;
};

export function* createProxyServer(options: ProxyOptions): Operation {
  function* handleRequest(proxyRes, req, res): Operation {
    console.debug('[proxy]', 'start', req.method, req.url);
    for(let [key, value] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    yield watchError(proxyRes);

    if(contentType && contentType.split(';')[0] === 'text/html') {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');
      res.removeHeader('last-modified');
      res.removeHeader('etag');

      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      let tr = trumpet();
      let unzip = zlib.createGunzip();

      yield watchError(tr);
      yield watchError(unzip);

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
        yield on(tr, 'end');
      } finally {
        // tr.close(); there is no close method on Trumpet, how do we not leak it in case of errors?
        unzip.close();
      }
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      proxyRes.pipe(res);

      yield on(proxyRes, 'end');
    }
    console.debug('[proxy]', 'finish', req.method, req.url);
  };

  let proxyServer = proxy.createProxyServer({
    target: `http://localhost:${options.targetPort}`,
    selfHandleResponse: true
  });

  let events = yield Mailbox.watch(proxyServer, ['proxyRes', 'error', 'open', 'close']);

  let server = http.createServer();

  server.on('request', (req, res) => proxyServer.web(req, res));
  server.on('upgrade', (req, socket, head) => proxyServer.ws(req, socket, head));


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

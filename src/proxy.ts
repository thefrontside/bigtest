import { fork, Sequence, Controller, Execution } from 'effection';
import { on } from '@effection/events';
import * as proxy from 'http-proxy';
import * as http from 'http';
import { listen, ReadyCallback } from './http';
import { forkOnEvent,  } from './util';
import * as trumpet from 'trumpet';
import * as zlib from 'zlib';
import { Readable, Writable } from 'stream';

interface ProxyOptions {
  port: number;
  targetPort: number;
  inject?: string;
};

export function* createProxyServer(options: ProxyOptions, ready: ReadyCallback = x => x): Sequence {
  let proxyServer = proxy.createProxyServer({
    target: `http://localhost:${options.targetPort}`,
    selfHandleResponse: true
  });

  forkOnEvent(proxyServer, 'proxyRes', function*(proxyRes, req, res) {
    console.debug("[proxy]", "start", req.method, req.url);
    for(let [key, value] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    forkOnEvent(proxyRes, 'error', function*(error) { throw error; });

    if(contentType && contentType.split(';')[0] === 'text/html') {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');

      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      let tr = trumpet();
      forkOnEvent(tr, 'error', function*(error) { throw error; });

      let nodeHandler = fork(function* () {
        tr.select('head', (node) => nodeHandler.resume(node));
        while(true) {
          let node = yield;
          let rs = node.createReadStream();
          let ws = node.createWriteStream();
          ws.write(options.inject || '');
          rs.pipe(ws);
        }
      });

      if(contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
        let unzip = zlib.createGunzip();
        forkOnEvent(unzip, 'error', function*(error) { throw error; });

        proxyRes.pipe(unzip);
        unzip.pipe(tr);
      } else {
        proxyRes.pipe(tr);
      }

      tr.pipe(res);

      yield on(tr, "end");

      nodeHandler.halt();
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      proxyRes.pipe(res);

      yield on(proxyRes, "end");
    }
    console.debug("[proxy]", "finish", req.method, req.url);
  });

  forkOnEvent(proxyServer, 'error', function*(err, req, res) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err}`);
  });

  forkOnEvent(proxyServer, 'open', function*() {
    console.debug('socket connection opened');
  });

  forkOnEvent(proxyServer, 'close', function*() {
    console.debug('socket connection closed');
  });

  let server = http.createServer();

  yield listen(server, options.port);

  ready(server);

  forkOnEvent(server, 'request', function*(req, res) {
    proxyServer.web(req, res);
  });

  forkOnEvent(server, 'upgrade', function*(req, socket, head) {
    proxyServer.ws(req, socket, head);
  });

  try {
    yield;
  } finally {
    server.close();
    proxyServer.close();
  }
}

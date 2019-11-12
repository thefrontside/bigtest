import { fork, Sequence } from 'effection';
import { on } from '@effection/events';
import { AddressInfo } from 'net';
import * as proxy from 'http-proxy';
import * as http from 'http';
import { listen, ReadyCallback } from './http';
import { forkOnEvent,  } from './util';
import * as trumpet from 'trumpet';
import * as zlib from 'zlib';

interface ProxyOptions {
  port: number,
  targetPort: number
  inject?: string
};

function pipe(from, to) {
  fork(function*() {
    let writer = forkOnEvent(from, 'data', function*(chunk) {
      to.write(chunk);
    });

    try {
      yield on(from, 'end');
      to.end();
    } finally {
      writer.halt();
    }
  });
}

export function* createProxyServer(options: ProxyOptions, ready: ReadyCallback = x => x): Sequence {
  let proxyServer = proxy.createProxyServer({
    target: `http://localhost:${options.targetPort}`,
    selfHandleResponse: true
  });

  forkOnEvent(proxyServer, 'proxyRes', function*(proxyRes, req, res) {
    for(let [key, value] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    if(contentType && contentType.split(';')[0] === 'text/html') {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');

      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      let tr = trumpet();

      tr.select('head', (node) => {
        let rs = node.createReadStream();
        let ws = node.createWriteStream();
        ws.write(options.inject || '');
        rs.pipe(ws);
      });

      if(contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
        let zip = zlib.createGunzip();

        pipe(proxyRes, zip);
        pipe(zip, tr);
      } else {
        pipe(proxyRes, tr);
      }

      pipe(tr, res);
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);
      pipe(proxyRes, res);
    }
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

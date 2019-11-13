import { fork, Sequence, Controller, Execution } from 'effection';
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

function pipe(from, to): Controller {
  let listener = fork(function*() {
    forkOnEvent(from, 'data', function*(chunk) {
      to.write(chunk);
    });
    forkOnEvent(from, 'error', function*(error) {
      throw error;
    });
    forkOnEvent(to, 'error', function*(error) {
      throw error;
    });
  });

  return (execution: Execution) => {
    let resume = () => {
      to.end();
      execution.resume([]);
    }
    from.on("end", resume);
    return () => {
      listener.halt();
      from.off("end", resume);
    }
  };
}

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

    if(contentType && contentType.split(';')[0] === 'text/html') {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');

      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      let tr = trumpet();

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

        fork(function*() { yield pipe(proxyRes, unzip) });
        fork(function*() { yield pipe(unzip, tr) });
      } else {
        fork(function*() { yield pipe(proxyRes, tr) });
      }

      yield pipe(tr, res);
      nodeHandler.halt();
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);
      yield pipe(proxyRes, res);
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

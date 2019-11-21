import { fork, Sequence, Controller, Execution } from 'effection';
import { on } from '@effection/events';
import * as proxy from 'http-proxy';
import * as http from 'http';
import { listen, ReadyCallback } from './http';
import { forkOnEvent,  } from './util';
import * as trumpet from 'trumpet';
import * as zlib from 'zlib';
import { Readable, Writable } from 'stream';
import { Process } from './process';

interface ProxyOptions {
  port: number;
  targetPort: number;
  inject?: string;
};

export class ProxyServer extends Process {
  constructor(public options: ProxyOptions) {
    super();
  }

  protected *run(ready): Sequence {
    let { inject, port, targetPort } = this.options;

    let proxyServer = proxy.createProxyServer({
      target: `http://localhost:${targetPort}`,
      selfHandleResponse: true
    });

    forkOnEvent(proxyServer, 'proxyRes', function*(proxyRes, req, res) {
      console.debug("[proxy]", "start", req.method, req.url);
      for(let [key, value] of Object.entries(proxyRes.headers)) {
        res.setHeader(key, value);
      }

      let contentType = proxyRes.headers['content-type'] as string;
      let contentEncoding = proxyRes.headers['content-encoding'] as string;

      let proxyResMonitor = forkOnEvent(proxyRes, 'error', function*(error) { throw error; });

      if(contentType && contentType.split(';')[0] === 'text/html') {
        res.removeHeader('content-length');
        res.removeHeader('content-encoding');

        res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

        let tr = trumpet();
        let trMonitor = forkOnEvent(tr, 'error', function*(error) { throw error; });

        let unzip = zlib.createGunzip();
        let unzipMonitor = forkOnEvent(unzip, 'error', function*(error) { throw error; });

        let nodeMonitor = fork(function* () {
          tr.select('head', (node) => nodeMonitor.resume(node));
          while(true) {
            let node = yield;
            let rs = node.createReadStream();
            let ws = node.createWriteStream();
            ws.write(inject || '');
            rs.pipe(ws);
          }
        });

        if(contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
          proxyRes.pipe(unzip);
          unzip.pipe(tr);
        } else {
          proxyRes.pipe(tr);
        }

        tr.pipe(res);

        try {
          yield on(tr, "end");
        } finally {
          // tr.close(); there is no close method on Trumpet, how do we not leak it in case of errors?
          unzip.close();

          proxyResMonitor.halt();
          trMonitor.halt();
          unzipMonitor.halt();
          nodeMonitor.halt();
        }
      } else {
        res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

        proxyRes.pipe(res);

        try {
          yield on(proxyRes, "end");
        } finally {
          proxyResMonitor.halt();
        }
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

    yield listen(server, port);

    ready && ready();

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
}

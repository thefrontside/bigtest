import { fork, receive, any, Sequence, Execution, Operation } from 'effection';
import { on, watch, watchError } from '@effection/events';

import * as proxy from 'http-proxy';
import * as http from 'http';
import * as trumpet from 'trumpet';
import * as zlib from 'zlib';

import { listen } from './http';
import { Process } from './process';

interface ProxyOptions {
  port: number;
  targetPort: number;
  inject?: string;
};

export function createProxyServer(orchestrator: Execution, options: ProxyOptions): Operation {
  function* handleRequest(proxyRes, req, res): Sequence {
    console.debug('[proxy]', 'start', req.method, req.url);
    for(let [key, value] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    watchError(this, proxyRes);

    if(contentType && contentType.split(';')[0] === 'text/html') {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');

      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      let tr = trumpet();
      let unzip = zlib.createGunzip();

      watchError(this, tr);
      watchError(this, unzip);

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

  return function *proxyServer(): Sequence {
    let proxyServer = proxy.createProxyServer({
      target: `http://localhost:${options.targetPort}`,
      selfHandleResponse: true
    });
    this.atExit(() => proxyServer.close());

    watch(this, proxyServer, ['proxyRes', 'error', 'open', 'close']);

    let server = http.createServer();
    this.atExit(() => server.close());
    server.on('request', (req, res) => proxyServer.web(req, res));
    server.on('upgrade', (req, socket, head) => proxyServer.ws(req, socket, head));

    yield listen(server, options.port);
    orchestrator.send({ ready: 'proxy' });

    while(true) {
      let { event, args } = yield receive({ event: any("string") });

      if(event == "error") {
        let [err, req, res] = args;
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
        fork(function*() {
          yield handleRequest.call(this, proxyRes, req, res);
        });
      }
    }
  }
};

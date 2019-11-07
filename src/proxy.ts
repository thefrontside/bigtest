import { Sequence } from 'effection';
import { AddressInfo } from 'net';
import * as proxy from 'http-proxy';
import * as http from 'http';
import { EventEmitter } from './util';
import * as trumpet from 'trumpet';
import * as zlib from 'zlib';

interface ProxyOptions {
  port: number,
  targetPort: number
  inject?: string
};

export function* createProxyServer(options: ProxyOptions): Sequence {
  let proxyServer = proxy.createProxyServer({
    target: `http://localhost:${options.targetPort}`,
    selfHandleResponse: true
  });

  let server = http.createServer();

  server.listen(options.port, () => {
    let address = server.address() as AddressInfo;
    console.log(`-> proxy listening on port ${address.port}`)
  });

  proxyServer.on('proxyRes', (proxyRes, req, res) => {
    for(let [key, value] of Object.entries(proxyRes.headers)) {
      res.setHeader(key, value);
    }

    let contentType = proxyRes.headers['content-type'] as string;
    let contentEncoding = proxyRes.headers['content-encoding'] as string;

    if(contentType && contentType.split(";")[0] === "text/html") {
      res.removeHeader('content-length');
      res.removeHeader('content-encoding');

      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      let tr = trumpet();

      tr.select("head", (node) => {
        let rs = node.createReadStream();
        let ws = node.createWriteStream();
        ws.write(options.inject || "");
        rs.pipe(ws);
      });

      if(contentEncoding && contentEncoding.toLowerCase() == "gzip") {
        let zip = zlib.createGunzip();

        zip.on('data', (chunk) => tr.write(chunk));
        zip.on('end', () => tr.end());

        proxyRes.on('data', (chunk) => zip.write(chunk));
        proxyRes.on('end', () => zip.end());
      } else {
        proxyRes.on('data', (chunk) => tr.write(chunk));
        proxyRes.on('end', () => tr.end());
      }

      tr.on('data', (chunk) => res.write(chunk));
      tr.on('end', () => res.end());
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);

      proxyRes.on('data', (chunk) => res.write(chunk));
      proxyRes.on('end', (chunk) => res.end(chunk));
    }
  });

  proxyServer.on('error', function(err, req, res) {
    console.error("PROXY ERROR", err);

    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err}`);
  });

  proxyServer.on('open', () => console.debug("socket connection opened"));
  proxyServer.on('close', () => console.debug("socket connection closed"));

  server.on('request', (req, res) => {
    proxyServer.web(req, res);
  });

  server.on('upgrade', (req, socket, head) => {
    proxyServer.ws(req, socket, head);
  });

  try {
    yield;
  } finally {
    server.close();
    proxyServer.close();
  }
}

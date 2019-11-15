import * as Bundler from 'parcel-bundler';
import * as Path from 'path';
import * as http from 'http';

export type ReadyCallback = (server: http.Server) => void;

const entryFiles = [
  Path.join(__dirname, '../agent/index.html'),
  Path.join(__dirname, '../agent/harness.ts'),
];

export function* agentServer(port: number, ready: ReadyCallback = x => x) {
  let bundler = new Bundler(entryFiles, {});
  let server = yield bundler.serve(port);

  ready(server);

  try {
    yield;
  } finally {
    server.close();
  }
}

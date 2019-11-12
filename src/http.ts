import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Operation, Sequence, fork } from 'effection';
import { on } from '@effection/events';

export { IncomingMessage } from 'http';

import { resumeOnCb } from './util';

export type RequestHandler = (req: IncomingMessage, res: Response) => Operation;
export type ReadyCallback = (server: http.Server) => void;

export function* createServer(port: number, handler: RequestHandler, ready: ReadyCallback = x => x): Sequence {
  let server = http.createServer();

  yield listen(server, port);

  ready(server);

  try {
    while (true) {
      let [request, response]: [IncomingMessage, ServerResponse] = yield on(server, "request");
      fork(function* outerRequestHandler() {
        let requestErrorMonitor = fork(function* () {
          let [error]: [Error] = yield on(request, "error");
          throw error;
        });
        let responseErrorMonitor = fork(function* () {
          let [error]: [Error] = yield on(response, "error");
          throw error;
        });
        try {
          yield handler(request, new Response(response));
        } finally {
          requestErrorMonitor.halt();
          responseErrorMonitor.halt();
        }
      });
    }
  } finally {
    server.close();
  }
}

export class Response {
  constructor(private inner: ServerResponse) {}

  writeHead(statusCode: number, headers?: http.OutgoingHttpHeaders): http.ServerResponse {
    return this.inner.writeHead(statusCode, headers);
  };

  end(body: string): Operation {
    return resumeOnCb((cb) => this.inner.end(body, cb));
  }
}

export function* listen(server: http.Server, port: number): Operation {

  let errors = fork(function* errorListener() {
    let [error]: [Error] = yield on(server, "error");
    throw error;
  })

  try {
    server.listen(port);
    yield on(server, "listening");
  } finally {
    errors.halt();
  }
}

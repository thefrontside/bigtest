import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Execution, Operation, Sequence, fork } from 'effection';

export { IncomingMessage } from 'http';

import { getCurrentExecution, resumeOnCb } from './util';

export type RequestHandler = (req: IncomingMessage, res: Response) => Operation;
export type ReadyCallback = (server: http.Server) => void;

export function* createServer(port: number, handler: RequestHandler, ready: ReadyCallback = x => x): Sequence {
  let execution = getCurrentExecution();

  let server = http.createServer((request, response) => {
    execution.resume([request, response]);
  });

  yield listen(server, port);

  ready(server);

  try {
    while (true) {
      let [request, response] = yield;
      fork(handler(request, new Response(response)));
    }
  } finally {
    server.close();
  }
}

export class Response {
  private inner: ServerResponse

  constructor(response) {
    this.inner = response;
  }

  writeHead(statusCode: number, headers?: http.OutgoingHttpHeaders): http.ServerResponse {
    return this.inner.writeHead(statusCode, headers);
  };

  end(body): Operation {
    return (execution: Execution<void>) => {
      let fail = (error: Error) => execution.throw(error);
      this.inner.end(body, () => execution.resume());
      this.inner.on("error", fail);
      return () => this.inner.off("error", fail);
    }
  }
}

export function listen(server: http.Server, port: number): Operation {
  return (execution: Execution<void>) => {

    let succeed = () => execution.resume();
    let fail = (error: Error) => execution.throw(error);

    server.on('error', fail);
    server.on('listening', succeed);

    server.listen(port);

    return () => {
      server.off('listening', succeed);
      server.off('error', fail);
    };
  }
}

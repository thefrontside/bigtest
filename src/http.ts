import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Execution, Operation, Sequence, fork } from 'effection';

export { IncomingMessage, ServerResponse } from 'http';

import { getCurrentExecution } from './util';

export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => Operation;
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
      fork(handler(request, response));
    }
  } finally {
    server.close();
  }
}

export function end(res: ServerResponse, body: string): Operation {
  return (execution: Execution<void>) => {
    let fail = (error: Error) => execution.throw(error);
    res.end(body, () => execution.resume());

    return () => res.off("error", fail);
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

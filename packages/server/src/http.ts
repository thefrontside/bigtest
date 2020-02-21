import * as http from 'http';
import { Operation, fork } from 'effection';
import { on } from '@effection/events';

export { IncomingMessage } from 'http';

export type ReadyCallback = (server: http.Server) => void;

export function* listen(server: http.Server, port: number): Operation {

  let errors = yield fork(function* errorListener() {
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

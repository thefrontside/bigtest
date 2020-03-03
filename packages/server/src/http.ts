import * as http from 'http';
import { Operation, fork } from 'effection';
import { once } from '@bigtest/effection';

export { IncomingMessage } from 'http';

export type ReadyCallback = (server: http.Server) => void;

export function* listen(server: http.Server, port: number): Operation {

  let errors = yield fork(function* errorListener() {
    let [error]: [Error] = yield once(server, "error");
    throw error;
  })

  try {
    server.listen(port);
    yield once(server, "listening");
  } finally {
    errors.halt();
  }
}

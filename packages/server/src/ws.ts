import { createServer, Server } from 'http';
import {
  server as WebSocketServer,
  connection as Connection,
  request as Request,
  IMessage as Message
} from 'websocket';

import { fork, Operation } from 'effection';
import { resumeOnCb } from './util';

import { once } from '@bigtest/effection';

import { listen } from './http';

interface UseServer { (server: Server): Operation }

export function* createSocketServer(port: number, handler: ConnectionHandler, ready: UseServer): Operation {
  let server = createServer();

  yield listen(server, port);

  yield ready(server);

  try {
    yield listenWS(server, handler);
  } finally {
    server.close();
  }
}

export function* listenWS(server: Server, handler: ConnectionHandler): Operation {
  let socket = new WebSocketServer({
    httpServer: server
  });

  try {
    while (true) {
      let [request]: [Request] = yield once(socket, "request");
      let connection = request.accept(null, request.origin);

      let handle = yield fork(function* setupConnection() {
        let halt = () => handle.halt();
        let fail = (error: Error) => {
          if(error["code"] === 'ECONNRESET') {
            handle.halt();
          } else {
            handle.fail(error);
          }
        }
        connection.on("error", fail);
        connection.on("close", halt);
        try {
          yield handler(connection);
        } finally {
          connection.off("close", halt);
          connection.off("error", fail);
          connection.close();
        }
      });

    }
  } finally {
    socket.unmount();
  }
}

export function sendData(connection: Connection, data: string): Operation {
  return resumeOnCb(cb => connection.send(data, cb));
}

export { Connection, Message }

type ConnectionHandler = (conn: Connection) => Operation;

import { Operation, Resource, Subscription, createStream, ensure, spawn } from 'effection';
import actualExpress from 'express';
import WebSocket from 'ws';
import ews from 'express-ws';
import { promisify } from 'util';
import { Server } from 'http';

import { throwOnErrorEvent, once, on } from '@effection/events';

type OperationRequestHandler = (req: actualExpress.Request, res: actualExpress.Response) => Operation<void>;
type WsOperationRequestHandler<TReceive, TSend> = (socket: Socket<TReceive, TSend>, req: actualExpress.Request) => Operation<void>;

export type Response = actualExpress.Response;
export type Request = actualExpress.Request;

export interface CloseEvent {
  readonly code: number;
  readonly reason: string;
}

export type Socket<TReceive = unknown, TSend = TReceive> = Subscription<TReceive, CloseEvent> & {
  send(data: TSend): Operation<void>;
  subscription: Subscription<TReceive, CloseEvent>;
  raw: WebSocket,
}

export interface Express {
  use(handler: OperationRequestHandler): void;
  get(path: string, handler: OperationRequestHandler): void;
  ws<TReceive = unknown, TSend = unknown>(path: string, handler: WsOperationRequestHandler<TReceive, TSend>): void;
  listen(port: number): Operation<Server>;
  join(): Operation<void>;
  raw: ews.Application;
}

export function express(): Resource<Express> {
  return {
    *init(scope) {
      let raw = ews(actualExpress()).app;
      let server: Server;

      return {
        raw,

        use(handler) {
          raw.use((req, res) => {
            scope.run(function*() {
              yield handler(req, res);
            });
          });
        },

        get(path, handler) {
          raw.get(path, (req, res) => {
            scope.run(function*() {
              yield handler(req, res);
            });
          });
        },

        ws<TReceive = unknown, TSend = unknown>(path: string, handler: WsOperationRequestHandler<TReceive, TSend>): void {
          raw.ws(path, (rawSocket, req) => {
            scope.run(function*() {
              try {
                let subscription: Subscription<TReceive, CloseEvent> = yield createStream<TReceive, CloseEvent>(function*(publish) {
                  yield spawn(on<MessageEvent>(rawSocket, 'message').map((event) => JSON.parse(event.data)).forEach(publish));
                  let close: CloseEvent = yield once(rawSocket, 'close');
                  return { code: close.code || 1006, reason: close.reason || ''};
                });
                let socket: Socket<TReceive, TSend> = {
                  ...subscription,
                  subscription,
                  raw: rawSocket,
                  send: (data: TSend) => function*() {
                    if(rawSocket.readyState === 1) {
                      yield promisify<string, void>(rawSocket.send.bind(rawSocket))(JSON.stringify(data));
                    }
                  }
                }
                yield handler(socket, req);
              } finally {
                rawSocket.close();
                req.destroy();
              }
            });
          })
        },

        *listen(port) {
          server = raw.listen(port);

          scope.run(throwOnErrorEvent(server));
          scope.run(ensure(() => { server.close() }));

          yield once(server, "listening");

          return server;
        },

        *join() {
          if (server) {
            yield once(server, 'close');
          }
        }
      }
    }
  }
}

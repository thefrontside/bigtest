import { Operation, resource, spawn } from 'effection';
import * as actualExpress from 'express';
import { RequestHandler } from 'express';
import * as ws from 'ws';
import * as ews from 'express-ws';
import { Server } from 'http';

import { throwOnErrorEvent, once } from '@effection/events';
import { ensure } from '@bigtest/effection';

type OperationRequestHandler = (req: actualExpress.Request, res: actualExpress.Response) => Operation<void>;
type WsOperationRequestHandler = (ws: ws, req: actualExpress.Request) => Operation<void>;

export class Express {
  private inner: ews.Application;
  private server?: Server;

  constructor(inner: ews.Application) {
    this.inner = inner;
  }

  use(...handlers: RequestHandler[]) {
    this.inner.use(...handlers);
  }

  *useOperation(handler: OperationRequestHandler): Operation<void> {
    yield (controls) => {
      this.inner.use((req, res) => {
        controls.spawn(handler(req, res));
      });
    };
  }

  *ws(path: string, handler: WsOperationRequestHandler): Operation<void> {
    yield (controls) => {
      this.inner.ws(path, (socket, req) => {
        controls.spawn(function*(): Operation<void> {
          yield ensure(() => socket.close());
          yield spawn(handler(socket, req));

          let [{ reason, code }] = yield once(socket, 'close');
          if(code !== 1000) {
            throw new Error(`websocket client closed connection unexpectedly: [${code}] ${reason}`);
          }
        });
      })
    }
  }

  *listen(port: number): Operation<Server> {
    let server = this.server = this.inner.listen(port);

    let res = yield resource(server, function*() {
      yield throwOnErrorEvent(server);
      yield ensure(() => server.close());
      yield;
    });

    yield once(server, "listening");

    return res;
  }

  *join(): Operation<void> {
    if (this.server) {
      yield once(this.server, 'close');
    }
  }
}

export function express(): Express {
  return new Express(ews(actualExpress()).app);
}

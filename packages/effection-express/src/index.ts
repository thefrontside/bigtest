import { Operation, resource } from 'effection';
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
    yield ({ spawn }) => {
      this.inner.use((req, res) => {
        spawn(handler(req, res));
      });
    };
  }

  *ws(path: string, handler: WsOperationRequestHandler): Operation<void> {
    yield ({ spawn }) => {
      this.inner.ws(path, (ws, req) => {
        spawn(handler(ws, req));
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

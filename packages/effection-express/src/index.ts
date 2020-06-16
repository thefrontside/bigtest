import { Operation, resource, spawn } from 'effection';
import * as actualExpress from 'express';
import { RequestHandler, IRouterHandler, IRouterMatcher } from 'express';
import * as WebSocket from 'ws';
import * as ews from 'express-ws';
import * as util from 'util';
import { Server } from 'http';

import { throwOnErrorEvent, once, on } from '@effection/events';
import { Mailbox, ensure } from '@bigtest/effection';

type OperationRequestHandler = (req: actualExpress.Request, res: actualExpress.Response) => Operation<void>;
type WsOperationRequestHandler = (socket: Socket, req: actualExpress.Request) => Operation<void>;

export class Socket {
  constructor(public raw: WebSocket) {}

  *send(data: unknown) {
    if(this.raw.readyState === 1) {
      yield util.promisify(this.raw.send.bind(this.raw))(JSON.stringify(data));
    }
  }

  *subscribe(): Operation<Mailbox> {
    let { raw } = this;
    let mailbox = new Mailbox();
    return yield resource(mailbox, function*(): Operation<void> {
      let subscription = yield on(raw, 'message');

      while(true) {
        let { value: [message] } = yield subscription.next();
        mailbox.send(JSON.parse(message.data));
      }
    });
  }
}

export class Express {
  private inner: ews.Application;
  private server?: Server;

  constructor(inner: ews.Application) {
    this.inner = inner;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use: IRouterHandler<Express> & IRouterMatcher<Express> = function(this: Express, ...args: any[]) {
    this.inner.use(...args);
    return this;
  };

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
          yield ensure(() => req.destroy());
          yield spawn(handler(new Socket(socket), req));

          let [{ reason, code }] = yield once(socket, 'close');
          if(code !== 1000 && code !== 1001) {
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

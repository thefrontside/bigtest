import { Operation, resource, spawn } from 'effection';
import * as actualExpress from 'express';
import * as WebSocket from 'ws';
import * as ews from 'express-ws';
import * as util from 'util';
import { Server } from 'http';

import { throwOnErrorEvent, once, on } from '@effection/events';
import { Subscribable, SymbolSubscribable, Subscription, subscribe } from '@effection/subscription';
import { Mailbox, ensure } from '@bigtest/effection';

type OperationRequestHandler = (req: actualExpress.Request, res: actualExpress.Response) => Operation<void>;
type WsOperationRequestHandler = (socket: Socket, req: actualExpress.Request) => Operation<void>;

// JSON.parse return type is `any`, so that's the type
// of the subscription
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Socket implements Subscribable<any, void> {
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

  // JSON.parse return type is `any`, so that's the type
  // of the subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  *[SymbolSubscribable](): Operation<Subscription<any, void>> {
    let { raw } = this;
    let messages = Subscribable.from(on<MessageEvent[]>(raw, 'message'))
      .map(([event]) => JSON.parse(event.data));
    return yield subscribe(messages);
  }
}

export class Express {
  private server?: Server;

  constructor(public raw: ews.Application) {}

  *use(handler: OperationRequestHandler): Operation<{}> {
    return yield resource({}, (controls) => {
      this.raw.use((req, res) => {
        controls.spawn(function*() {
          yield handler(req, res);
        });
      });
    });
  }

  *ws(path: string, handler: WsOperationRequestHandler): Operation<{}> {
    return yield resource({}, (controls) => {
      this.raw.ws(path, (socket, req) => {
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
    })
  }

  *listen(port: number): Operation<Server> {
    let server = this.server = this.raw.listen(port);

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

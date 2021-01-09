import { Operation, resource, spawn } from 'effection';
import * as actualExpress from 'express';
import * as WebSocket from 'ws';
import * as ews from 'express-ws';
import * as util from 'util';
import { Server } from 'http';

import { throwOnErrorEvent, once, on } from '@effection/events';
import { Subscribable, SymbolSubscribable, Subscription, subscribe, createSubscription } from '@effection/subscription';
import { ensure } from '@bigtest/effection';

type OperationRequestHandler = (req: actualExpress.Request, res: actualExpress.Response) => Operation<void>;
type WsOperationRequestHandler = (socket: Socket, req: actualExpress.Request) => Operation<void>;

export type Response = actualExpress.Response;
export type Request = actualExpress.Request;

export interface CloseEvent {
  readonly code: number;
  readonly reason: string;
}

// JSON.parse return type is `any`, so that's the type
// of the subscription
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Socket implements Subscribable<any, CloseEvent> {
  constructor(public raw: WebSocket) {}

  *send(data: unknown): Operation<void> {
    if(this.raw.readyState === 1) {
      yield util.promisify<string, void>(this.raw.send.bind(this.raw))(JSON.stringify(data));
    }
  }

  // JSON.parse return type is `any`, so that's the type
  // of the subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  *[SymbolSubscribable](): Operation<Subscription<any, CloseEvent>> {
    let { raw } = this;
    return yield createSubscription(function*(publish) {
      yield spawn(subscribe(on<MessageEvent[]>(raw, 'message')
                            .map(([event]) => JSON.parse(event.data)))
                  .forEach(function*(message) {
                    publish(message);
                  }));

      let [close]: [CloseEvent] = yield once(raw, 'close');
      return { code: close.code || 1006, reason: close.reason || ''};
    });
  }
}

export class Express {
  private server?: Server;

  constructor(public raw: ews.Application) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  *use(handler: OperationRequestHandler): Operation<{}> {
    return yield resource({}, (controls) => {
      this.raw.use((req, res) => {
        controls.spawn(function*() {
          yield handler(req, res);
        });
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  *get(path: string, handler: OperationRequestHandler): Operation<{}> {
    return yield resource({}, (controls) => {
      this.raw.get(path, (req, res) => {
        controls.spawn(function*() {
          yield handler(req, res);
        });
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  *ws(path: string, handler: WsOperationRequestHandler): Operation<{}> {
    return yield resource({}, (controls) => {
      this.raw.ws(path, (socket, req) => {
        controls.spawn(function*(): Operation<void> {
          try {
            yield handler(new Socket(socket), req);
          } finally {
            socket.close();
            req.destroy();
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

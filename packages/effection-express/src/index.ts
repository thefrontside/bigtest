import { Operation, resource } from 'effection';
import * as actualExpress from 'express';
import { Express as ActualExpress, RequestHandler } from 'express';
import { Server } from 'http';

import { throwOnErrorEvent, once } from '@effection/events';
import { ensure } from '@bigtest/effection';

export class Express {
  private inner: ActualExpress;
  private server?: Server;

  constructor(inner: ActualExpress) {
    this.inner = inner;
  }

  use(...handlers: RequestHandler[]) {
    this.inner.use(...handlers);
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
  return new Express(actualExpress())
}

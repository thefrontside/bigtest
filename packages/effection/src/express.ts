import { Operation, resource } from 'effection';
import * as actualExpress from 'express';
import { Express as ActualExpress } from 'express';

import { monitorErrors } from './monitor-errors';
import { once } from './events';
import { ensure } from './ensure';
import { Server } from 'http';

export class Express {
  private inner: ActualExpress;
  private server: Server;

  constructor(inner) {
    this.inner = inner;
  }

  use(middleware) {
    this.inner.use(middleware);
  }

  *listen(port: number): Operation<Server> {
    let server = this.server = this.inner.listen(port);

    let res = yield resource(server, function*() {
      yield monitorErrors(server);
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

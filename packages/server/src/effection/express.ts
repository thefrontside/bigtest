import { Operation } from 'effection';
import * as actualExpress from 'express';
import { Express as ActualExpress } from 'express';
import { once, suspend, ensure, monitorErrors } from '@bigtest/effection';

export class Express {
  private inner: ActualExpress;

  constructor(inner) {
    this.inner = inner;
  }

  use(middleware) {
    this.inner.use(middleware);
  }

  *listen(port): Operation {
    let server = this.inner.listen(port);
    yield once(server, "listening");

    yield suspend(monitorErrors(server));
    yield suspend(ensure(() => server.close()));

    return server;
  }
}

export function express(): Express {
  return new Express(actualExpress())
}

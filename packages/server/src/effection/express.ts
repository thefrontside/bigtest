import { Operation } from 'effection';
import * as actualExpress from 'express';
import { Express as ActualExpress } from 'express';
import { watchError } from '@effection/events';

export class Express {
  private inner: ActualExpress;

  constructor(inner) {
    this.inner = inner;
  }

  use(middleware) {
    this.inner.use(middleware);
  }

  listen(port): Operation {
    return ({ resume, ensure, context: { parent }}) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parentContext = parent as any;

      let server = this.inner.listen(port);
      let listener = () => resume(server);

      server.on('listening', listener);

      ensure(() => server.off('listening', listener));

      parentContext.spawn(watchError(server));
      parentContext.ensure(() => server.close());
    }
  }
}

export function express(): Express {
  return new Express(actualExpress())
}

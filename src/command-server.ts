import { Sequence, Execution, fork } from 'effection';
import { createServer, IncomingMessage, Response } from './http';
import { Process } from './process';

interface CommandServerOptions {
  port: number;
};

export class CommandServer extends Process {
  constructor(public options: CommandServerOptions) {
    super();
  }

  *run(ready): Sequence {
    function* handleRequest(req: IncomingMessage, res: Response): Sequence {
      res.writeHead(200, {
        'X-Powered-By': 'effection'
      });
      yield res.end("Your wish is my command\n");
    }
    yield createServer(this.options.port, handleRequest, ready);
  }
}

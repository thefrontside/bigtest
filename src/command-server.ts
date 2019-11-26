import { Sequence, Operation, Execution } from 'effection';
import { createServer, IncomingMessage, Response } from './http';
import { Process } from './process';

interface CommandServerOptions {
  port: number;
};

export function createCommandServer(orchestrator: Execution, options: CommandServerOptions): Operation {
  return function *commandServer(): Sequence {
    function* handleRequest(req: IncomingMessage, res: Response): Sequence {
      res.writeHead(200, {
        'X-Powered-By': 'effection'
      });
      yield res.end("Your wish is my command\n");
    }
    yield createServer(options.port, handleRequest, () => {
      orchestrator.send({ ready: "command" });
    });
  }
}

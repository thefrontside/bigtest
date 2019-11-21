import { Sequence } from 'effection';
import { createServer, IncomingMessage, Response } from './http';
import { ReadyCallback } from './http';

interface CommandServerOptions {
  port: number;
  onReady: ReadyCallback;
};

export function createCommandServer(options: CommandServerOptions): Sequence {
  function* handleRequest(req: IncomingMessage, res: Response): Sequence {
    res.writeHead(200, {
      'X-Powered-By': 'effection'
    });
    yield res.end("Your wish is my command\n");
  }
  return createServer(options.port, handleRequest, options.onReady);
};
